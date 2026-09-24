-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nev" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "szerepkor" TEXT NOT NULL DEFAULT 'munkatars',
    "letrehozva" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nev" TEXT NOT NULL,
    "szekhely" TEXT,
    "telefonszam" TEXT,
    "email" TEXT,
    "statisztikai_szamjel" TEXT,
    "mak_azonosito" TEXT,
    "megjegyzes" TEXT,
    "letrehozva" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modositva" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "partnerId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "ev" INTEGER NOT NULL,
    "tipus" TEXT NOT NULL,
    "allapot" TEXT NOT NULL DEFAULT 'FOLYAMATBAN',
    "letrehozva" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modositva" DATETIME NOT NULL,
    "torzs" JSONB,
    "lehalaszasVallalkozas" JSONB,
    CONSTRAINT "Survey_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Survey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Telephely" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "surveyId" INTEGER NOT NULL,
    "sorszam" INTEGER NOT NULL DEFAULT 1,
    "nev" TEXT NOT NULL,
    "telepiAdat" JSONB,
    "allomanyvaltozas" JSONB,
    "letrehozva" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modositva" DATETIME NOT NULL,
    CONSTRAINT "Telephely_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Survey_partnerId_ev_tipus_key" ON "Survey"("partnerId", "ev", "tipus");

-- CreateIndex
CREATE UNIQUE INDEX "Telephely_surveyId_sorszam_key" ON "Telephely"("surveyId", "sorszam");
