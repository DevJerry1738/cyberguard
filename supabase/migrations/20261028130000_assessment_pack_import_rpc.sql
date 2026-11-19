alter table public.assessment_pack_imports
  add column request_payload jsonb not null default '{}'::jsonb;

alter table public.assessment_pack_imports
  alter column request_payload drop default;

create or replace function public.import_assessment_pack(
  p_pack_version_id uuid,
  p_template_name text,
  p_template_description text,
  p_template_version text,
  p_domain_mappings jsonb,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
  v_template_id uuid;
  v_import_id uuid;
  v_role_owner boolean;
  v_role_admin boolean;
  v_role_security_officer boolean;
  v_pack_key text;
  v_pack_id uuid;
  v_pack_name text;
  v_pack_version_label text;
  v_existing_payload jsonb;
  v_request_payload jsonb;
  v_domain_count integer;
  v_mapping_count integer;
  v_map jsonb;
  v_pack_domain_id uuid;
  v_security_domain_id uuid;
  v_new_domain_name text;
  v_pack_domain_name text;
  v_domain_sort_order integer;
  v_question record;
  v_question_id uuid;
  v_option record;
  v_control record;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required';
  end if;

  select p.organization_id
    into v_organization_id
  from public.profiles p
  join public.organization_members om
    on om.profile_id = p.id and om.organization_id = p.organization_id
  where p.id = v_user_id;

  if v_organization_id is null then
    raise exception using errcode = '42501', message = 'Organization membership required';
  end if;

  v_role_owner := public.has_org_role(v_organization_id, 'Owner');
  v_role_admin := public.has_org_role(v_organization_id, 'Admin');
  v_role_security_officer := public.has_org_role(v_organization_id, 'Security Officer');
  if not (v_role_owner or v_role_admin or v_role_security_officer) then
    raise exception using errcode = '42501', message = 'Insufficient permission to import assessment packs';
  end if;

  if p_idempotency_key is null then
    raise exception using errcode = '22023', message = 'An idempotency key is required';
  end if;
  if p_template_name is null or char_length(btrim(p_template_name)) not between 3 and 255 then
    raise exception using errcode = '22023', message = 'Template name must be between 3 and 255 characters';
  end if;
  if p_template_version is null or p_template_version !~ '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$' then
    raise exception using errcode = '22023', message = 'Template version must use semantic version format';
  end if;
  if p_template_description is not null and char_length(p_template_description) > 1000 then
    raise exception using errcode = '22023', message = 'Template description is too long';
  end if;
  if jsonb_typeof(p_domain_mappings) <> 'array' then
    raise exception using errcode = '22023', message = 'Domain mappings must be an array';
  end if;

  v_request_payload := jsonb_build_object(
    'pack_version_id', p_pack_version_id,
    'template_name', btrim(p_template_name),
    'template_description', p_template_description,
    'template_version', p_template_version,
    'domain_mappings', p_domain_mappings
  );

  select i.id, i.template_id, i.request_payload
    into v_import_id, v_template_id, v_existing_payload
  from public.assessment_pack_imports i
  where i.organization_id = v_organization_id
    and i.idempotency_key = p_idempotency_key;

  if v_import_id is not null then
    if v_existing_payload is distinct from v_request_payload then
      raise exception using errcode = '22023', message = 'Idempotency key was already used with a different request';
    end if;
    return jsonb_build_object('success', true, 'template_id', v_template_id, 'import_id', v_import_id, 'replayed', true);
  end if;

  select p.pack_key, p.id, p.display_name, pv.version_label
    into v_pack_key, v_pack_id, v_pack_name, v_pack_version_label
  from public.assessment_pack_versions pv
  join public.assessment_packs p on p.id = pv.pack_id
  where pv.id = p_pack_version_id
    and pv.status = 'approved'
    and pv.review_status = 'approved';

  if v_pack_key is null then
    raise exception using errcode = '22023', message = 'Approved assessment pack version not found';
  end if;

  select count(*) into v_domain_count
  from public.assessment_pack_domains d
  where d.pack_version_id = p_pack_version_id;

  select count(*) into v_mapping_count
  from jsonb_array_elements(p_domain_mappings);

  if v_domain_count = 0 or v_domain_count <> v_mapping_count then
    raise exception using errcode = '22023', message = 'A mapping is required for every pack domain';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_domain_mappings) m
    group by m->>'pack_domain_id'
    having count(*) > 1
  ) then
    raise exception using errcode = '22023', message = 'Pack domains may only be mapped once';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_domain_mappings) m
    left join public.assessment_pack_domains d
      on d.id = (m->>'pack_domain_id')::uuid
     and d.pack_version_id = p_pack_version_id
    where d.id is null
  ) then
    raise exception using errcode = '22023', message = 'Domain mapping references an invalid pack domain';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_domain_mappings) m
     where (m->>'security_domain_id' is null and not coalesce((m->>'create_domain')::boolean, false))
       or (m->>'security_domain_id' is not null and coalesce((m->>'create_domain')::boolean, false))
  ) then
    raise exception using errcode = '22023', message = 'Each pack domain must map to an organization domain or request domain creation';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_domain_mappings) m
    where coalesce((m->>'create_domain')::boolean, false)
      and not (v_role_owner or v_role_admin)
  ) then
    raise exception using errcode = '42501', message = 'Only Owners and Admins can create organization domains during import';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_domain_mappings) m
    where m->>'security_domain_id' is not null
      and not exists (
        select 1 from public.security_domains sd
        where sd.id = (m->>'security_domain_id')::uuid
          and sd.organization_id = v_organization_id
          and sd.deleted_at is null
          and not sd.is_archived
      )
  ) then
    raise exception using errcode = '42501', message = 'A selected domain does not belong to this organization or is inactive';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_domain_mappings) m
    where m->>'security_domain_id' is not null
    group by m->>'security_domain_id'
    having count(*) > 1
  ) then
    raise exception using errcode = '22023', message = 'Each organization domain can be selected only once';
  end if;

  if exists (
    select 1 from public.assessment_pack_questions q
    where q.pack_version_id = p_pack_version_id and q.review_status <> 'approved'
  ) or not exists (
    select 1 from public.assessment_pack_questions q
    where q.pack_version_id = p_pack_version_id
  ) then
    raise exception using errcode = '22023', message = 'Pack version contains unapproved or missing questions';
  end if;

  insert into public.assessment_templates (
    organization_id, name, description, framework, version, status, created_by, updated_by
  ) values (
    v_organization_id, btrim(p_template_name), nullif(btrim(p_template_description), ''),
    v_pack_name, p_template_version, 'Draft', v_user_id, v_user_id
  ) returning id into v_template_id;

  insert into public.assessment_pack_imports (
    organization_id, template_id, pack_version_id, pack_key_at_import,
    pack_name_at_import, version_label_at_import, imported_by, idempotency_key, request_payload
  ) values (
    v_organization_id, v_template_id, p_pack_version_id, v_pack_key,
    v_pack_name, v_pack_version_label, v_user_id, p_idempotency_key, v_request_payload
  ) returning id into v_import_id;

  for v_map in select value from jsonb_array_elements(p_domain_mappings)
  loop
    v_pack_domain_id := (v_map->>'pack_domain_id')::uuid;
    select d.name, d.sort_order into v_pack_domain_name, v_domain_sort_order
    from public.assessment_pack_domains d
    where d.id = v_pack_domain_id and d.pack_version_id = p_pack_version_id;

    if coalesce((v_map->>'create_domain')::boolean, false) then
      v_new_domain_name := coalesce(nullif(btrim(v_map->>'new_domain_name'), ''), v_pack_domain_name);
      if char_length(v_new_domain_name) not between 3 and 100 then
        raise exception using errcode = '22023', message = 'New domain name must be between 3 and 100 characters';
      end if;
      insert into public.security_domains (
        organization_id, name, description, sort_order, created_by, updated_by
      ) values (
        v_organization_id, v_new_domain_name, 'Created from the CyberGuard assessment pack catalogue.',
        coalesce(v_domain_sort_order, 0), v_user_id, v_user_id
      ) returning id into v_security_domain_id;
    else
      v_security_domain_id := (v_map->>'security_domain_id')::uuid;
    end if;

    insert into public.assessment_template_domains(template_id, domain_id, sort_order)
    values (v_template_id, v_security_domain_id, coalesce(v_domain_sort_order, 0));

    insert into public.assessment_pack_import_domains (
      organization_id, import_id, pack_version_id, pack_domain_id, security_domain_id
    ) values (
      v_organization_id, v_import_id, p_pack_version_id, v_pack_domain_id, v_security_domain_id
    );

    for v_question in
      select q.* from public.assessment_pack_questions q
      where q.pack_version_id = p_pack_version_id
        and q.pack_domain_id = v_pack_domain_id
      order by q.sort_order, q.question_key
    loop
      if v_question.question_type in ('multiple_choice', 'checkbox') and (
        select count(*) from public.assessment_pack_question_options o where o.pack_question_id = v_question.id
      ) < 2 then
        raise exception using errcode = '22023', message = 'Choice question has fewer than two options';
      end if;

      insert into public.assessment_questions (
        organization_id, template_id, domain_id, question_text, help_text, question_type,
        is_required, weight, sort_order, metadata, created_by, updated_by,
        source_pack_id, source_pack_version_id, source_pack_question_id
      ) values (
        v_organization_id, v_template_id, v_security_domain_id, v_question.question_text,
        v_question.help_text, v_question.question_type, v_question.is_required,
        v_question.weight, v_question.sort_order,
        jsonb_build_object('pack_question_key', v_question.question_key, 'evidence_guidance', v_question.evidence_guidance),
        v_user_id, v_user_id, v_pack_id, p_pack_version_id, v_question.id
      ) returning id into v_question_id;

      for v_option in
        select o.* from public.assessment_pack_question_options o
        where o.pack_question_id = v_question.id
        order by o.sort_order
      loop
        insert into public.assessment_question_options(question_id, label, value, sort_order)
        values (v_question_id, v_option.label, v_option.value, v_option.sort_order);
      end loop;

      for v_control in
        select m.*, c.control_identifier, fv.version_label, f.framework_key, f.name as framework_name
        from public.assessment_pack_question_controls m
        join public.framework_controls c on c.id = m.framework_control_id
        join public.framework_versions fv on fv.id = c.framework_version_id
        join public.frameworks f on f.id = fv.framework_id
        where m.pack_question_id = v_question.id
          and m.pack_version_id = p_pack_version_id
          and m.review_status = 'verified'
          and c.review_status = 'verified'
          and fv.status = 'approved'
      loop
        insert into public.assessment_question_controls (
          organization_id, question_id, framework_control_id, source_pack_question_control_id,
          framework_key_at_mapping, framework_name_at_mapping, framework_version_at_mapping,
          control_identifier_at_mapping, mapping_source, source_reference, review_status,
          reviewed_by, reviewed_at, created_by
        ) values (
          v_organization_id, v_question_id, v_control.framework_control_id, v_control.id,
          v_control.framework_key, v_control.framework_name, v_control.version_label,
          v_control.control_identifier, v_control.mapping_source, v_control.source_reference,
          'verified', v_control.reviewed_by, v_control.reviewed_at, v_user_id
        );
      end loop;
    end loop;
  end loop;

  insert into public.audit_logs(organization_id, profile_id, action, details)
  values (
    v_organization_id, v_user_id, 'assessment.pack.import',
    jsonb_build_object('template_id', v_template_id, 'import_id', v_import_id,
      'pack_key', v_pack_key, 'pack_version_id', p_pack_version_id,
      'pack_version', v_pack_version_label)
  );

  return jsonb_build_object('success', true, 'template_id', v_template_id, 'import_id', v_import_id, 'replayed', false);
end;
$$;

revoke all on function public.import_assessment_pack(uuid, text, text, text, jsonb, uuid) from public, anon;
grant execute on function public.import_assessment_pack(uuid, text, text, text, jsonb, uuid) to authenticated;