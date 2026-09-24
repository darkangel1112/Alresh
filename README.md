# Alresh – AKI halgazdálkodási adatgyűjtő

Helyi webalkalmazás az AKI halgazdálkodási felméréseinek rögzítéséhez. Extenzív és intenzív termelési adatlapokat, vállalkozásokat és több telephelyet kezel.

## Főbb funkciók

- Partner- és kérdőívkezelés
- Extenzív és intenzív, több telephelyes adatfelvétel
- Mentés SQLite adatbázisba
- Excel-adatlapokhoz igazított gazdasági, munkaerő-, takarmány-, ár-, költség- és állományadatok
- Saját stílusú, billentyűzettel is kezelhető megerősítő ablakok

## Mintaadatok

A `prisma/dev.db` adatbázis fiktív bemutatóadatokat tartalmaz: 6 `MINTA` jelölésű vállalkozást és 8 telephelyet az extenzív és intenzív adatlapok bemutatásához. A minta e-mail-címek `.test` végződésűek; valós statisztikai számjel vagy MÁK-azonosító nincs bennük.

## Helyi indítás

Szükséges: Node.js 20.9 vagy újabb és npm.

```powershell
Copy-Item .env.example .env
npm ci
npx prisma generate
npm run dev
```

Ezután nyisd meg a [http://localhost:3000](http://localhost:3000) címet. A fejlesztői szerver az alkalmazáskód alapján a `prisma/dev.db` adatbázishoz csatlakozik.

## Technológia

- Next.js 16 és React 19
- TypeScript
- Prisma 7
- SQLite (`@libsql/client` adapter)

## Adatvédelem

Az adatbázisban lévő vállalkozási és telephelyi adatok bemutató célúak. Valós gazdasági adatok nyilvános GitHub-tárba feltöltése előtt az adatbázist cseréld vagy ürítsd. A `.env` fájl és a függőségek nincsenek a tárban.
