# PRIVATE.md — the shape

Copy this to `PRIVATE.md` beside a skill and fill in your own. It's gitignored.

Everything in here is an **address**. The skill file is the method and stays public; this
is the set of values that would let a stranger reach your data or name the people around
you. The test: would someone building their own version need it? Then it's public.

## Accounts

- **Telegram chat id** — from `@userinfobot`
- **Notion data sources** — `collection://<id>` for the digest database, the task board,
  and anything else the skill queries
- **Supabase project refs**, if you read a database. A project ref is the database's
  public hostname, so it does not belong in a public file.
- **Calendar ids.** Names are not addressable — you need the ids. Most calendar APIs
  default to reading only the primary calendar, which is how you end up telling someone
  their day is empty when it isn't.

## Slack

| Channel | ID | What's in it |
|---|---|---|
| `#urgent` | `C0…` | check first, every run |
| `#finance` | `C0…` | read to know what *not* to repeat |
| `#jokes` | `C0…` | the one people actually open |

## People

Who the named colleagues are, so the skill can say "the finance lead" and stay
publishable. This is also the file that keeps other people's names out of a public repo
they never agreed to be in.

## Anything personal

Health, money, family, anything said to you in confidence. The digest can absolutely use
these — that's most of what makes it useful — but the public repo should not carry them.
