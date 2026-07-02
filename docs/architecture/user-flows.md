# User Flows & Interactions

This document diagrams step-by-step user interactions across key features using Mermaid flowcharts.

---

## 1. Registration, Email Verification, & Login

```mermaid
flowchart TD
    Start([User starts onboarding]) --> Reg[Register Page]
    Reg --> Form{Enter Details}
    Form --> Sign[Click Sign Up]
    Sign --> Auth[Supabase Auth creates user]
    Auth --> Verify[Send verification email]
    Verify --> Waiting[User opens email client]
    Waiting --> Link[Clicks link]
    Link --> Session[Supabase validates session]
    Session --> Choice{Has Invitation?}
    
    Choice -- Yes --> Join[Join Organization]
    Choice -- No --> Create[Create New Organization]
    
    Create --> Dash[Load Dashboard]
    Join --> Dash
```

---

## 2. Department Creation & User Invitation

```mermaid
flowchart TD
    Admin([Admin logged in]) --> Nav[Go to Settings]
    Nav --> Choice{Target Action?}
    
    Choice -- Create Department --> DepForm[Enter Department Name]
    DepForm --> SaveDep[Save to Database]
    SaveDep --> RefreshDep[Department active]
    
    Choice -- Invite User --> InvForm[Enter Email & Select Role]
    InvForm --> GenToken[Server generates secure token]
    GenToken --> SendMail[Send Invite Email]
    SendMail --> Pending[Status: Pending Invite]
```

---

## 3. Assessment Completion & Reporting

```mermaid
flowchart TD
    User([Compliance Officer logged in]) --> Dash[Open Dashboard]
    Dash --> Assess[Select Active Assessment Session]
    Assess --> Questions[Display security questionnaire]
    
    Questions --> Fill[Answer questions]
    Fill --> Upload[Upload verification evidence files]
    Upload --> Save[Save Draft responses]
    
    Save --> Check{All questions answered?}
    Check -- No --> Questions
    Check -- Yes --> Submit[Click Submit Assessment]
    
    Submit --> RiskEngine[Calculate risk scores & recommendations]
    RiskEngine --> Review[Generate Compliance Report PDF]
```
