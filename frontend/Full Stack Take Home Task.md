### **Product Overview:**

**ResolveIt** is an app designed to resolve disputes between parties, communities, or individuals through mediation. The system allows users to register disputes, share evidence, and create a mediation panel that includes legal and social experts. The platform follows a structured lifecycle to ensure fairness and transparency in resolving issues.

The app leverages a mediation process, supported by expert advice, to guide users through difficult situations such as disputes between spouses, business partners, families, or even communities.

It provides features such as:

**Virtual Mediation**: A platform for live discussions with professional mediators.

**Dispute Tracking**: A system to log issues and monitor the progress of the resolution process.

**Educational Resources**: Articles, videos, and workshops to help users understand conflict resolution techniques.

**Agreement Generation**: A tool for creating formal agreements based on the outcomes of mediation.

---

### **Full Stack Developer (React, Next.js, Python/Node)**

#### **Task 1: Registration Flow and Schema Design**

**Scenario:**  
 You are tasked with developing the **User Registration** and **Case Registration** system. This will include forms for individual/party registration and case details, along with verification of contact information.

**Requirements:**

1. **User Registration:**

   * **Party Details:**

     * Name, Age, Gender, Address (street, city, zip code), Email, Phone number, Photo.

   * **Case Details:**

     * Case Type (e.g., Family, Business, Criminal), Issue description, Opposite party details (name, contact, address), Proof Upload (image, video, voice file).

     * A field to indicate whether the issue is pending in a judicial court or police station (e.g., Case Number, FIR Number, Court/Police Station name).

2. **Case Verification:**

   * Implement a verification flow that checks whether the case is pending in court or at a police station.

   * The system will queue the case and notify the opposite party if they are willing to proceed with mediation.

   * Ensure data integrity, validation, and verification (using automated and manual checks).

**Deliverables:**

* Database schema for user and case registration.

* Backend API for registering users and cases (Node.js or Python).

* Frontend form development in React/Next.js for both registration flows.

* Automated validation of input fields (e.g., phone number, email format).

* Document and proof upload functionality.

**Passing Criteria:**

* Clean and scalable API endpoints.

* User-friendly frontend registration form.

* Modular code that follows best practices (e.g., clean code, comments, separation of concerns).

* Proper error handling and input validation.

* Testing of the registration flow using Postman (with API documentation).

---

#### **Task 2: Case Lifecycle Management and Dashboard**

**Scenario:**  
 Now that users can register their cases, we need to manage the lifecycle of these cases and display statuses in a dashboard.

**Requirements:**

1. **Case Lifecycle:**

   * When the case is registered, the system must queue it for review.

   * Once the opposite party is contacted, the status should update automatically to **“Awaiting Response”** or **“Accepted”**.

   * Include a verification system for checking if the opposite party agrees to proceed with mediation.

   * Once both parties agree, allow them to nominate witnesses.

   * After a panel is created (including at least one lawyer, one religious scholar, and one reputable member of society), update the status to **“Panel Created”**.

   * The panel’s role is to mediate the case by inviting both parties and resolving the issue through compromise.

   * The status updates will follow through: **“Mediation in Progress”**, **“Resolved”**, or **“Unresolved”**.

2. **Dashboard:**

   * Create a dashboard for admins to track the status of each case in real-time.

   * Cases should be categorized based on their status: Pending, In Progress, Resolved, Unresolved.

   * Display statistics such as number of active cases, cases resolved, and ongoing cases.

   * Include filters to allow easy tracking of case categories (e.g., family, business, criminal).

**Deliverables:**

* Backend API to handle case lifecycle and status updates (Node.js or Python).

* Frontend dashboard built with React/Next.js for admins to track cases.

* Implement real-time updates (e.g., WebSockets or polling for status updates).

* Frontend should allow filtering of cases based on their status and type.

* Implement an Admin Panel to oversee the dispute resolution process.

**Passing Criteria:**

* Modular backend code with clear API documentation.

* Functional, intuitive, and responsive dashboard with case tracking.

* Real-time status updates using appropriate technologies (e.g., WebSockets).

* Secure access to the dashboard (admin authentication).

### 

### **Security Testing & Best Practices:**

* The code must follow standard development practices: modular, scalable, readable, and well-documented.

* Perform thorough security testing:

  * Protect against all kind of frontend/UI attack(CSRF etc)

  * Ensure API security (authentication, authorization).

  * Implement prevention of SQL injection, XSS, and other common vulnerabilities.

  * Test penetration and spoofing attacks.

  * Validate input/output to prevent parameter pollution and other injection attacks.

---

### **Submission Instructions:**

- Submit the solution as a ZIP folder or Google Drive link containing:

  * Full codebase (frontend \+ backend).

  * Database schema and API documentation (Postman collection).

  * Screenshots or video recording of the entire registration, case lifecycle, and notification process.

  * Any test cases or scripts used for testing security vulnerabilities.

    **Loom Video** (Mandatory):

- Create a short Loom video where you:  
  *   
    * Demonstrate working features

    * Explain code structure

    * Show live execution of flows

---

### **Evaluation Process:**

1. **Stage 1: Take-Home Assignment** (this task).

2. **Stage 2: Technical Interview** (based on your code and implementation).

3. **Stage 3: Technical Interview** 

The take home task is paid, if you qualify both technical rounds. We are excited to review your submission and look forward to your solution\!

**IMPORTANT :** 

