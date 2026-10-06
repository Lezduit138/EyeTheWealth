-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "code2" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "incomeLevel" TEXT,
    "capitalCity" TEXT,
    "longitude" REAL,
    "latitude" REAL,
    "flagEmoji" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "methodology" TEXT,
    "unit" TEXT NOT NULL,
    "worldBankCode" TEXT,
    "imfCode" TEXT,
    "whoCode" TEXT,
    "oecdCode" TEXT,
    "isWealth" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Indicator_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "indicatorId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "value" REAL,
    "unit" TEXT,
    "year" INTEGER NOT NULL,
    "sourceId" TEXT,
    "sourceUrl" TEXT,
    "collectionDate" DATETIME,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "isSampleData" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DataPoint_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DataPoint_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DataPoint_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EtwInterpretation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "indicatorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "factors" TEXT,
    "lastReviewed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EtwInterpretation_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompareSelection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "indicatorId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompareSelection_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompareSelection_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ngo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "registrationType" TEXT,
    "registrationDate" DATETIME,
    "district" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT NOT NULL DEFAULT 'Maharashtra',
    "pincode" TEXT,
    "website" TEXT,
    "publicEmail" TEXT,
    "publicPhone" TEXT,
    "categories" TEXT,
    "areasOfWork" TEXT,
    "directorsPublic" TEXT,
    "ngoId" TEXT,
    "fcraRegistration" TEXT,
    "panNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSampleData" BOOLEAN NOT NULL DEFAULT true,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "sourceUrl" TEXT,
    "lastVerified" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NgoFinancialYear" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ngoId" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "totalIncome" REAL,
    "totalExpenditure" REAL,
    "donations" REAL,
    "grants" REAL,
    "csrFunding" REAL,
    "governmentFunding" REAL,
    "foreignContributions" REAL,
    "totalAssets" REAL,
    "totalLiabilities" REAL,
    "adminExpenditure" REAL,
    "programExpenditure" REAL,
    "sourceClassification" TEXT,
    "sourceId" TEXT,
    "sourceUrl" TEXT,
    "documentUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "isSampleData" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NgoFinancialYear_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "Ngo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NgoFinancialYear_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ngoId" TEXT NOT NULL,
    "date" DATETIME,
    "financialYear" TEXT,
    "senderName" TEXT,
    "senderType" TEXT,
    "recipientName" TEXT,
    "recipientType" TEXT,
    "amount" REAL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "purpose" TEXT,
    "transactionType" TEXT,
    "sourceClassification" TEXT,
    "sourceId" TEXT,
    "sourceUrl" TEXT,
    "evidenceDocumentId" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "isSampleData" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "Ngo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_evidenceDocumentId_fkey" FOREIGN KEY ("evidenceDocumentId") REFERENCES "EvidenceDocument" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "documentType" TEXT,
    "url" TEXT NOT NULL,
    "sourceOrg" TEXT,
    "publishedDate" DATETIME,
    "retrievedDate" DATETIME,
    "isSampleData" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Emergency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "disasterType" TEXT NOT NULL,
    "affectedDistricts" TEXT NOT NULL,
    "severity" TEXT,
    "description" TEXT,
    "reportedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSimulation" BOOLEAN NOT NULL DEFAULT false,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "rawAlertData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

-- CreateTable
CREATE TABLE "EmergencyNgoMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emergencyId" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPERATING_NEARBY',
    "matchReason" TEXT,
    "evidenceDocumentId" TEXT,
    "evidenceUrl" TEXT,
    "evidenceDate" DATETIME,
    "addedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmergencyNgoMatch_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "Emergency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmergencyNgoMatch_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "Ngo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmergencyNgoMatch_evidenceDocumentId_fkey" FOREIGN KEY ("evidenceDocumentId") REFERENCES "EvidenceDocument" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "jurisdiction" TEXT,
    "description" TEXT,
    "isPubliclyKnown" BOOLEAN NOT NULL DEFAULT false,
    "isSampleData" BOOLEAN NOT NULL DEFAULT true,
    "sourceUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EntityRelationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromEntityId" TEXT NOT NULL,
    "toEntityId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "amount" REAL,
    "currency" TEXT DEFAULT 'INR',
    "year" INTEGER,
    "description" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isGap" BOOLEAN NOT NULL DEFAULT false,
    "sourceUrl" TEXT,
    "evidenceNote" TEXT,
    "caseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EntityRelationship_fromEntityId_fkey" FOREIGN KEY ("fromEntityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EntityRelationship_toEntityId_fkey" FOREIGN KEY ("toEntityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EntityRelationship_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ILLUSTRATIVE',
    "legalMechanism" TEXT,
    "transparencyGap" TEXT,
    "whatIsKnown" TEXT,
    "whatCannotBeEstablished" TEXT,
    "educationalDisclaimer" TEXT,
    "isSampleData" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

-- CreateTable
CREATE TABLE "CaseEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "entityName" TEXT,
    "transactionDesc" TEXT,
    "documentTitle" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "evidenceDate" DATETIME,
    "evidenceDocumentId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseEvidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CaseEvidence_evidenceDocumentId_fkey" FOREIGN KEY ("evidenceDocumentId") REFERENCES "EvidenceDocument" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "passwordHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IngestionRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "recordsAdded" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsSkipped" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "notes" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code2_key" ON "Country"("code2");

-- CreateIndex
CREATE INDEX "Country_code_idx" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_slug_key" ON "Indicator"("slug");

-- CreateIndex
CREATE INDEX "Indicator_categoryId_idx" ON "Indicator"("categoryId");

-- CreateIndex
CREATE INDEX "Indicator_slug_idx" ON "Indicator"("slug");

-- CreateIndex
CREATE INDEX "DataPoint_countryId_idx" ON "DataPoint"("countryId");

-- CreateIndex
CREATE INDEX "DataPoint_indicatorId_idx" ON "DataPoint"("indicatorId");

-- CreateIndex
CREATE INDEX "DataPoint_year_idx" ON "DataPoint"("year");

-- CreateIndex
CREATE INDEX "DataPoint_verificationStatus_idx" ON "DataPoint"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "DataPoint_indicatorId_countryId_year_sourceId_key" ON "DataPoint"("indicatorId", "countryId", "year", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");

-- CreateIndex
CREATE INDEX "EtwInterpretation_indicatorId_idx" ON "EtwInterpretation"("indicatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Ngo_slug_key" ON "Ngo"("slug");

-- CreateIndex
CREATE INDEX "Ngo_district_idx" ON "Ngo"("district");

-- CreateIndex
CREATE INDEX "Ngo_registrationNumber_idx" ON "Ngo"("registrationNumber");

-- CreateIndex
CREATE INDEX "Ngo_slug_idx" ON "Ngo"("slug");

-- CreateIndex
CREATE INDEX "NgoFinancialYear_ngoId_idx" ON "NgoFinancialYear"("ngoId");

-- CreateIndex
CREATE INDEX "NgoFinancialYear_financialYear_idx" ON "NgoFinancialYear"("financialYear");

-- CreateIndex
CREATE INDEX "Transaction_ngoId_idx" ON "Transaction"("ngoId");

-- CreateIndex
CREATE INDEX "Transaction_financialYear_idx" ON "Transaction"("financialYear");

-- CreateIndex
CREATE INDEX "Transaction_verificationStatus_idx" ON "Transaction"("verificationStatus");

-- CreateIndex
CREATE INDEX "Emergency_isActive_idx" ON "Emergency"("isActive");

-- CreateIndex
CREATE INDEX "Emergency_disasterType_idx" ON "Emergency"("disasterType");

-- CreateIndex
CREATE INDEX "EmergencyNgoMatch_emergencyId_idx" ON "EmergencyNgoMatch"("emergencyId");

-- CreateIndex
CREATE INDEX "EmergencyNgoMatch_ngoId_idx" ON "EmergencyNgoMatch"("ngoId");

-- CreateIndex
CREATE INDEX "EmergencyNgoMatch_status_idx" ON "EmergencyNgoMatch"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyNgoMatch_emergencyId_ngoId_key" ON "EmergencyNgoMatch"("emergencyId", "ngoId");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_slug_key" ON "Entity"("slug");

-- CreateIndex
CREATE INDEX "EntityRelationship_fromEntityId_idx" ON "EntityRelationship"("fromEntityId");

-- CreateIndex
CREATE INDEX "EntityRelationship_toEntityId_idx" ON "EntityRelationship"("toEntityId");

-- CreateIndex
CREATE INDEX "EntityRelationship_caseId_idx" ON "EntityRelationship"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_slug_key" ON "Case"("slug");

-- CreateIndex
CREATE INDEX "CaseEvidence_caseId_idx" ON "CaseEvidence"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "IngestionRun_source_idx" ON "IngestionRun"("source");

-- CreateIndex
CREATE INDEX "IngestionRun_status_idx" ON "IngestionRun"("status");

-- CreateIndex
CREATE INDEX "IngestionRun_startedAt_idx" ON "IngestionRun"("startedAt");
