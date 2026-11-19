'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AssessmentDraftRecord, DraftResponses, SaveStatus } from '../schemas/draft';
import {
  getAssessmentDraft,
  saveAssessmentDraft,
  discardAssessmentDraft,
  syncOfflineDraft,
} from '../actions/drafts';
import {
  getLocalDraft,
  saveLocalDraft,
  deleteLocalDraft,
  enqueueOfflineSync,
  getSyncQueueItems,
  clearAllSyncQueue,
} from '../lib/localDraftStore';

interface DraftContextType {
  sessionId: string;
  responses: DraftResponses;
  currentDomain: string | null;
  currentQuestion: string | null;
  saveStatus: SaveStatus;
  version: number;
  lastSavedAt: string | null;
  isOffline: boolean;
  hasConflict: boolean;
  serverDraftForConflict: AssessmentDraftRecord | null;
  initialDraftToResume: AssessmentDraftRecord | null;
  updateResponse: (questionId: string, value: unknown) => void;
  updateNavigation: (domainId?: string | null, questionId?: string | null) => void;
  manualSave: () => Promise<boolean>;
  resolveConflictReload: () => Promise<void>;
  resolveConflictOverwrite: () => Promise<void>;
  discardDraft: () => Promise<void>;
  clearResumePrompt: () => void;
}

const DraftContext = createContext<DraftContextType | null>(null);

export interface DraftProviderProps {
  sessionId: string;
  children: React.ReactNode;
  initialResponses?: DraftResponses;
  onResponsesChange?: (responses: DraftResponses) => void;
}

export function DraftProvider({
  sessionId,
  children,
  initialResponses = {},
  onResponsesChange,
}: DraftProviderProps) {
  const [responses, setResponses] = useState<DraftResponses>(initialResponses);
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [version, setVersion] = useState<number>(1);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [hasConflict, setHasConflict] = useState<boolean>(false);
  const [serverDraftForConflict, setServerDraftForConflict] = useState<AssessmentDraftRecord | null>(null);
  const [initialDraftToResume, setInitialDraftToResume] = useState<AssessmentDraftRecord | null>(null);

  const isDirtyRef = useRef<boolean>(false);
  const editRevisionRef = useRef<number>(0);
  const saveInFlightRef = useRef<Promise<boolean> | null>(null);
  const responsesRef = useRef<DraftResponses>(initialResponses);
  const currentDomainRef = useRef<string | null>(null);
  const currentQuestionRef = useRef<string | null>(null);
  const versionRef = useRef<number>(1);

  const updateVersion = useCallback((nextVersion: number) => {
    versionRef.current = nextVersion;
    setVersion(nextVersion);
  }, []);

  // 1. Initial Draft Loading & Resume Detection
  useEffect(() => {
    let isMounted = true;

    async function loadDrafts() {
      try {
        const serverRes = await getAssessmentDraft(sessionId);
        const localDraft = await getLocalDraft(sessionId);

        if (!isMounted) return;

        let activeDraft: AssessmentDraftRecord | null = null;

        if (serverRes.success && serverRes.draft) {
          activeDraft = serverRes.draft;
        }

        // Compare local IndexedDB draft vs server draft timestamps
        if (localDraft && activeDraft) {
          const localTime = new Date(localDraft.lastSavedAt).getTime();
          const serverTime = new Date(activeDraft.last_saved_at).getTime();

          if (localTime > serverTime) {
            // Local draft is newer (e.g. edited offline or right before crash)
            updateVersion(localDraft.version);
            setLastSavedAt(localDraft.lastSavedAt);
            if (localDraft.responses && Object.keys(localDraft.responses).length > 0) {
              const restoredResponses = { ...localDraft.responses, ...responsesRef.current };
              responsesRef.current = restoredResponses;
              setResponses(restoredResponses);
              onResponsesChange?.(restoredResponses);
            }
            if (localDraft.currentDomain) {
              currentDomainRef.current = localDraft.currentDomain;
              setCurrentDomain(localDraft.currentDomain);
            }
            if (localDraft.currentQuestion) {
              currentQuestionRef.current = localDraft.currentQuestion;
              setCurrentQuestion(localDraft.currentQuestion);
            }

            setInitialDraftToResume({
              id: activeDraft.id,
              session_id: sessionId,
              user_id: activeDraft.user_id,
              organization_id: activeDraft.organization_id,
              responses: localDraft.responses,
              current_domain: localDraft.currentDomain,
              current_question: localDraft.currentQuestion,
              progress: activeDraft.progress,
              version: localDraft.version,
              checksum: null,
              last_saved_at: localDraft.lastSavedAt,
              created_at: activeDraft.created_at,
              updated_at: localDraft.updatedAt,
            });
            return;
          }
        }

        if (activeDraft) {
          updateVersion(activeDraft.version);
          setLastSavedAt(activeDraft.last_saved_at);
          if (activeDraft.responses && Object.keys(activeDraft.responses).length > 0) {
            const restoredResponses = { ...activeDraft.responses, ...responsesRef.current };
            responsesRef.current = restoredResponses;
            setResponses(restoredResponses);
            onResponsesChange?.(restoredResponses);
          }
          if (activeDraft.current_domain) {
            currentDomainRef.current = activeDraft.current_domain;
            setCurrentDomain(activeDraft.current_domain);
          }
          if (activeDraft.current_question) {
            currentQuestionRef.current = activeDraft.current_question;
            setCurrentQuestion(activeDraft.current_question);
          }

          setInitialDraftToResume(activeDraft);
        }
      } catch (err) {
        console.error('Error loading draft in DraftProvider:', err);
      }
    }

    loadDrafts();

    return () => {
      isMounted = false;
    };
  }, [sessionId, updateVersion, onResponsesChange]);

  // 2. Track online/offline status & trigger sync on reconnect
  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
      triggerOfflineSync();
    }

    function handleOffline() {
      setIsOffline(true);
      setSaveStatus('offline');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sessionId]);

  // 3. Offline Sync Logic
  const triggerOfflineSync = useCallback(async () => {
    const queue = await getSyncQueueItems(sessionId);
    if (queue.length === 0) return;

    setSaveStatus('sync_pending');
    const latestQueueItem = queue[queue.length - 1];

    const syncRes = await syncOfflineDraft({
      sessionId,
      responses: latestQueueItem.responses,
      currentDomain: latestQueueItem.currentDomain,
      currentQuestion: latestQueueItem.currentQuestion,
      clientVersion: latestQueueItem.version,
    });

    if (syncRes.success && syncRes.draft) {
      await clearAllSyncQueue(sessionId);
      updateVersion(syncRes.draft.version);
      setLastSavedAt(syncRes.draft.last_saved_at);
      setSaveStatus('saved');
      await saveLocalDraft({
        sessionId,
        responses: syncRes.draft.responses,
        currentDomain: syncRes.draft.current_domain,
        currentQuestion: syncRes.draft.current_question,
        version: syncRes.draft.version,
        lastSavedAt: syncRes.draft.last_saved_at,
      });
    } else if (syncRes.conflict && syncRes.serverDraft) {
      setHasConflict(true);
      setServerDraftForConflict(syncRes.serverDraft);
      setSaveStatus('conflict');
    } else {
      setSaveStatus('error');
    }
  }, [sessionId, updateVersion]);

  // 4. Save Execution Engine
  const performSave = useCallback(
    async (isManual: boolean = false): Promise<boolean> => {
      const activeSave = saveInFlightRef.current;
      if (activeSave) {
        const activeSaveSucceeded = await activeSave;
        if (!activeSaveSucceeded) return false;
        if (!isDirtyRef.current) return true;
      }

      if (!isDirtyRef.current && !isManual) return true;

      const savePromise = (async (): Promise<boolean> => {
        let shouldSave = isDirtyRef.current || isManual;

        while (shouldSave) {
          const revisionAtStart = editRevisionRef.current;
          const currentResponses = responsesRef.current;
          const domain = currentDomainRef.current;
          const question = currentQuestionRef.current;
          const ver = versionRef.current;

          setSaveStatus('saving');

          // Persist locally before each online/offline attempt.
          await saveLocalDraft({
            sessionId,
            responses: currentResponses,
            currentDomain: domain,
            currentQuestion: question,
            version: ver,
          });

          if (!navigator.onLine) {
            setIsOffline(true);
            setSaveStatus('offline');
            await enqueueOfflineSync({
              sessionId,
              responses: currentResponses,
              currentDomain: domain,
              currentQuestion: question,
              version: ver,
            });
            isDirtyRef.current = editRevisionRef.current !== revisionAtStart;
            if (isDirtyRef.current) continue;
            return true;
          }

          const res = await saveAssessmentDraft(
            {
              sessionId,
              responses: currentResponses,
              currentDomain: domain,
              currentQuestion: question,
              version: ver,
            },
            !isManual
          );

          if (res.success && res.draft) {
            updateVersion(res.draft.version);
            setLastSavedAt(res.draft.last_saved_at);

            // Update the local cache with the committed server revision.
            await saveLocalDraft({
              sessionId,
              responses: res.draft.responses,
              currentDomain: res.draft.current_domain,
              currentQuestion: res.draft.current_question,
              version: res.draft.version,
              lastSavedAt: res.draft.last_saved_at,
            });

            isDirtyRef.current = editRevisionRef.current !== revisionAtStart;
            if (isDirtyRef.current) {
              isManual = false;
              shouldSave = true;
              continue;
            }

            setSaveStatus('saved');
            return true;
          }

          if (res.conflict && res.serverDraft) {
            setHasConflict(true);
            setServerDraftForConflict(res.serverDraft);
            setSaveStatus('conflict');
            return false;
          }

          setSaveStatus('error');
          return false;
        }

        return true;
      })();

      saveInFlightRef.current = savePromise;
      try {
        return await savePromise;
      } finally {
        if (saveInFlightRef.current === savePromise) {
          saveInFlightRef.current = null;
        }
      }
    },
    [sessionId, updateVersion]
  );

  // 5. Debounced Typing Save (2-3 seconds debounce) & 5-Second Interval Safety Net
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isDirtyRef.current && navigator.onLine && !hasConflict) {
        performSave(false);
      }
    }, 2500);

    return () => clearTimeout(debounceTimer);
  }, [responses, performSave, hasConflict]);

  useEffect(() => {
    const intervalTimer = setInterval(() => {
      if (isDirtyRef.current && navigator.onLine && !hasConflict) {
        performSave(false);
      }
    }, 5000);

    return () => clearInterval(intervalTimer);
  }, [performSave, hasConflict]);

  // 6. Window Unload / Refresh Best-Effort Save
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirtyRef.current) {
        saveLocalDraft({
          sessionId,
          responses: responsesRef.current,
          currentDomain: currentDomainRef.current,
          currentQuestion: currentQuestionRef.current,
          version: versionRef.current,
        });
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId]);

  // Public Methods
  const updateResponse = useCallback(
    (questionId: string, value: unknown) => {
      const next = { ...responsesRef.current, [questionId]: value };
      responsesRef.current = next;
      setResponses(next);
      onResponsesChange?.(next);
      editRevisionRef.current += 1;
      isDirtyRef.current = true;
      setSaveStatus('unsaved');
    },
    [onResponsesChange]
  );

  const updateNavigation = useCallback((domainId?: string | null, questionId?: string | null) => {
    if (domainId !== undefined) {
      currentDomainRef.current = domainId;
      setCurrentDomain(domainId);
    }
    if (questionId !== undefined) {
      currentQuestionRef.current = questionId;
      setCurrentQuestion(questionId);
    }
  }, []);

  const manualSave = useCallback(async () => {
    return await performSave(true);
  }, [performSave]);

  const resolveConflictReload = useCallback(async () => {
    if (serverDraftForConflict) {
      setResponses(serverDraftForConflict.responses);
      onResponsesChange?.(serverDraftForConflict.responses);
      updateVersion(serverDraftForConflict.version);
      responsesRef.current = serverDraftForConflict.responses;
      currentDomainRef.current = serverDraftForConflict.current_domain;
      currentQuestionRef.current = serverDraftForConflict.current_question;
      editRevisionRef.current += 1;
      setLastSavedAt(serverDraftForConflict.last_saved_at);
      setCurrentDomain(serverDraftForConflict.current_domain);
      setCurrentQuestion(serverDraftForConflict.current_question);
      setHasConflict(false);
      setServerDraftForConflict(null);
      setSaveStatus('saved');
      isDirtyRef.current = false;

      await saveLocalDraft({
        sessionId,
        responses: serverDraftForConflict.responses,
        currentDomain: serverDraftForConflict.current_domain,
        currentQuestion: serverDraftForConflict.current_question,
        version: serverDraftForConflict.version,
        lastSavedAt: serverDraftForConflict.last_saved_at,
      });
    }
  }, [serverDraftForConflict, sessionId, onResponsesChange, updateVersion]);

  const resolveConflictOverwrite = useCallback(async () => {
    setSaveStatus('saving');
    const res = await saveAssessmentDraft(
      {
        sessionId,
        responses: responsesRef.current,
        currentDomain: currentDomainRef.current,
        currentQuestion: currentQuestionRef.current,
        version: versionRef.current,
        forceOverwrite: true,
      },
      false
    );

    if (res.success && res.draft) {
      updateVersion(res.draft.version);
      responsesRef.current = res.draft.responses;
      currentDomainRef.current = res.draft.current_domain;
      currentQuestionRef.current = res.draft.current_question;
      editRevisionRef.current += 1;
      setLastSavedAt(res.draft.last_saved_at);
      setHasConflict(false);
      setServerDraftForConflict(null);
      setSaveStatus('saved');
      isDirtyRef.current = false;

      await saveLocalDraft({
        sessionId,
        responses: res.draft.responses,
        currentDomain: res.draft.current_domain,
        currentQuestion: res.draft.current_question,
        version: res.draft.version,
        lastSavedAt: res.draft.last_saved_at,
      });
    } else {
      setSaveStatus('error');
    }
  }, [sessionId, updateVersion]);

  const discardDraft = useCallback(async () => {
    await discardAssessmentDraft(sessionId);
    await deleteLocalDraft(sessionId);
    await clearAllSyncQueue(sessionId);
    setInitialDraftToResume(null);
    setResponses({});
    updateVersion(1);
    responsesRef.current = {};
    currentDomainRef.current = null;
    currentQuestionRef.current = null;
    editRevisionRef.current += 1;
    setSaveStatus('saved');
    isDirtyRef.current = false;
  }, [sessionId, updateVersion]);

  const clearResumePrompt = useCallback(() => {
    setInitialDraftToResume(null);
  }, []);

  return (
    <DraftContext.Provider
      value={{
        sessionId,
        responses,
        currentDomain,
        currentQuestion,
        saveStatus,
        version,
        lastSavedAt,
        isOffline,
        hasConflict,
        serverDraftForConflict,
        initialDraftToResume,
        updateResponse,
        updateNavigation,
        manualSave,
        resolveConflictReload,
        resolveConflictOverwrite,
        discardDraft,
        clearResumePrompt,
      }}
    >
      {children}
    </DraftContext.Provider>
  );
}

export function useDraft() {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error('useDraft must be used within a DraftProvider');
  }
  return context;
}
