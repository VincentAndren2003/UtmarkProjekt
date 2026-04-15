# TypeScript Tutorial for Java Developers (Beginner Friendly)

This guide is for teams that already know Java and want to be productive in TypeScript quickly.

Learning flow:

1. Understand what TypeScript is
2. Set up a project and know why each command exists
3. Build and run your first app
4. Learn daily Java vs TypeScript patterns used in real projects

## 1) What TypeScript is

- TypeScript = JavaScript + static type checking
- TypeScript compiles to JavaScript
- Type information is checked at compile time, then removed at runtime

Java analogy:

- Java compiler -> bytecode for JVM
- TypeScript compiler (`tsc`) -> JavaScript for Node/browser

## 2) Setup from zero (with full "why")

## 2.1 Create project folder

```bash
mkdir ts-starter
cd ts-starter
```

Why:

- `mkdir` creates a clean project folder.
- `cd` enters it so all next commands affect this project.

## 2.2 Initialize npm project

```bash
npm init -y
```

What this does:

- Creates `package.json` in the current folder.
- `package.json` stores project name, version, scripts, and dependencies.

What `-y` means:

- `-y` means "yes to defaults".
- npm skips interactive questions and uses default values.

When to use `-y`:

- You want quick setup and can edit `package.json` later.

When not to use `-y`:

- You want to choose name/description/entry manually during init.
- In that case, run `npm init` without `-y`.

## 2.3 Install TypeScript development tools

```bash
npm install --save-dev typescript ts-node @types/node
```

Why each package:

- `typescript`: the compiler (`tsc`) and type-checker.
- `ts-node`: runs `.ts` directly in development (no manual compile step).
- `@types/node`: TypeScript types for Node APIs (`process`, `fs`, etc).

Why `--save-dev`:

- These are development tools, not runtime app libraries.
- They are saved under `devDependencies` in `package.json`.

## 2.4 Generate TypeScript config

```bash
npx tsc --init
```

What this does:

- Creates `tsconfig.json`.
- `tsconfig.json` controls how TypeScript compiles and type-checks code.

Why `npx`:

- Runs local project binaries from `node_modules/.bin`.
- Keeps tooling version consistent across collaborators.

## 2.5 Recommended strict starter config

Use strict mode early to catch bugs:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true
  }
}
```

Why:

- This is closest to Java-like safety expectations.

## 3) First app walkthrough (empty folder -> running output)

## 3.1 Expected starter structure

After setup, you usually have:

```text
ts-starter/
├─ node_modules/
├─ package.json
├─ package-lock.json
├─ tsconfig.json
└─ src/
   └─ index.ts
```

## 3.2 Create first TypeScript file

Create `src/index.ts`:

```ts
function greet(name: string): string {
  return `Hello, ${name}`;
}

console.log(greet("Utmark Team"));
```

Why:

- Shows typed parameters and return type.
- Mirrors Java method signatures but in TS syntax.

## 3.3 Run option A: direct development run

```bash
npx ts-node src/index.ts
```

Why:

- Fast feedback in development.
- No separate compile step required.

## 3.4 Run option B: compile then execute JavaScript

```bash
npx tsc
node src/index.js
```

Why:

- Matches production mental model: compile first, run output second.
- Similar to Java compile/run separation.

## 3.5 First-run troubleshooting

- `command not found: npx`:
  - install recent Node.js version.
- `Cannot find module ...`:
  - run `npm install` again.
- Type errors when compiling:
  - read first error carefully; fix type mismatch at source.

## 4) Java vs TypeScript fundamentals you use daily

## 4.1 Types and inference

Java:

```java
int count = 10;
String name = "Ana";
```

TypeScript:

```ts
let count: number = 10;
let name = "Ana"; // inferred as string
```

Daily takeaway:

- TS can infer many types, but explicit types are useful in public APIs.

## 4.2 Interfaces, classes, and structural typing

Java interface:

```java
public interface UserService {
    User findById(String id);
}
```

TypeScript interface:

```ts
interface UserService {
  findById(id: string): User;
}
```

Important difference:

- Java typing is nominal (by declared type).
- TS typing is structural (by shape).

```ts
interface User {
  id: string;
  name: string;
}

const row = { id: "1", name: "Lee", role: "admin" };
const user: User = row; // valid because required shape exists
```

## 4.3 Null and optional values

In Java, teams often use `Optional<T>`.
In TypeScript, common patterns are `T | undefined` and optional fields.

```ts
type UserDto = {
  id: string;
  nickname?: string; // optional field
};

function displayName(user: UserDto): string {
  return user.nickname ?? "Anonymous";
}
```

Daily takeaway:

- Always handle `undefined` in strict mode.

## 4.4 Collections and map lookups

Java:

```java
Map<String, User> usersById = new HashMap<>();
```

TypeScript:

```ts
const usersById = new Map<string, User>();
// or object map:
const usersByIdRecord: Record<string, User> = {};
```

When to use which:

- `Map` for frequent inserts/deletes and non-string keys.
- `Record<string, T>` for JSON-like object maps.

## 4.5 Async flow: blocking style vs async/await

Java backend often feels linear with thread-per-request.
Node.js is event-loop based, so async I/O is standard:

```ts
async function loadUser(id: string): Promise<User> {
  return { id, name: "Ana" };
}

async function run(): Promise<void> {
  const user = await loadUser("1");
  console.log(user.name);
}
```

Daily takeaway:

- Use `async/await` for readable async logic.

## 5) Everyday backend patterns (Java-style thinking in TS)

## 5.1 DTO modeling for API requests/responses

```ts
type CreateUserRequest = {
  email: string;
  password: string;
};

type UserResponse = {
  id: string;
  email: string;
};
```

Why:

- Same idea as Java DTO classes, but often type aliases/interfaces in TS.

## 5.2 Service layer function with typed contracts

```ts
class UserService {
  private users: UserResponse[] = [];

  create(dto: CreateUserRequest): UserResponse {
    const created = { id: String(this.users.length + 1), email: dto.email };
    this.users.push(created);
    return created;
  }
}
```

Why:

- Keeps clear input/output contracts just like Java service methods.

## 5.3 Parse external API payload safely

TypeScript types alone do not validate runtime data.
For external input, validate with a schema library:

```ts
import { z } from "zod";

const WeatherSchema = z.object({
  city: z.string(),
  tempC: z.number(),
});

type Weather = z.infer<typeof WeatherSchema>;

function parseWeather(input: unknown): Weather {
  return WeatherSchema.parse(input);
}
```

Why:

- Equivalent to explicit validation layers in Java apps.

## 5.4 Array transforms: Java Streams vs TS array methods

Java:

```java
List<String> activeNames = users.stream()
    .filter(User::isActive)
    .map(User::getName)
    .collect(Collectors.toList());
```

TypeScript:

```ts
const activeNames = users.filter((u) => u.isActive).map((u) => u.name);
```

Why:

- Similar functional flow to Streams; usually very readable in TS.

## 5.5 Environment config with safe parsing

```ts
function readPort(): number {
  const raw = process.env.PORT;
  const parsed = Number(raw ?? "3000");
  if (Number.isNaN(parsed)) {
    throw new Error("PORT must be a valid number");
  }
  return parsed;
}
```

Why:

- Avoids fragile assumptions around `process.env` string values.

## 5.6 Error handling pattern

Exception style:

```ts
function requireEmail(email: string | undefined): string {
  if (!email) throw new Error("Email is required");
  return email;
}
```

Result-object style (common in TS services):

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function parsePositiveInt(raw: string): Result<number> {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0)
    return { ok: false, error: "Invalid positive integer" };
  return { ok: true, value: n };
}
```

Why:

- Many TS teams prefer explicit result unions for expected business errors.

## 6) Common Java -> TypeScript translation map

- `String` -> `string`
- `int/double/long` -> `number`
- `boolean` -> `boolean`
- `List<T>` -> `T[]` or `Array<T>`
- `Map<K,V>` -> `Map<K, V>` or `Record<string, V>`
- `Optional<T>` -> `T | undefined` (or `T | null`)
- Java `enum` -> TS `enum` or union literals (`"A" | "B"`)

## 7) Common mistakes for Java developers (with fixes)

- Expecting types at runtime
  - Fix: validate external input explicitly (e.g., Zod).
- Using `any` early
  - Fix: prefer `unknown` and narrow safely.
- Ignoring `undefined`
  - Fix: use `??`, optional chaining, and strict null checks.
- Overusing classes for simple data
  - Fix: use interfaces/types for plain payloads and DTOs.
- Mixing compile and run expectations
  - Fix: choose one workflow (`ts-node` for dev, `tsc` + `node` for build/run).

## 8) Mini practice tasks

1. Create a `Product` type with `id`, `name`, `price`, and optional `discount`.
2. Implement `applyDiscount(product)` with typed input/output.
3. Build a `Map<string, Product>` for quick lookup by ID.
4. Parse a JSON payload safely with Zod before using it in a service.
5. Rewrite one Java Stream chain using TS `filter/map/reduce`.

## 9) Final mental model

Treat TypeScript as:

- JavaScript runtime
- plus compile-time type safety
- plus explicit runtime validation for external data

If you keep strict compiler settings and typed contracts in service boundaries, the transition from Java to TypeScript becomes straightforward and reliable.
