import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { usernameErrorMessage, type UsernameError } from '@/lib/users/username';
import { addContact, listContacts } from '@/lib/contacts/service';

/**
 * The caller's contacts (§11). GET lists them; POST adds one by @username. Adding resolves the
 * username to a real PrivyPay user, so a saved contact can always be paid.
 */

const FORMAT_ERRORS = new Set(['too_short', 'too_long', 'invalid_chars', 'reserved']);

function addErrorMessage(error: string): string {
  if (FORMAT_ERRORS.has(error)) return usernameErrorMessage(error as UsernameError);
  switch (error) {
    case 'no_such_user':
      return 'No PrivyPay user with that username.';
    case 'cannot_add_self':
      return "You can't add yourself.";
    case 'already_added':
      return 'They are already in your contacts.';
    default:
      return 'Could not add contact.';
  }
}

export async function GET(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  try {
    const user = await getOrCreateUser(auth.user.userId);
    const contacts = await listContacts(user.id);
    return NextResponse.json({ contacts });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;

  let body: { username?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'invalid_body');
  }
  const username = typeof body.username === 'string' ? body.username : '';
  if (!username) return jsonError(400, 'missing_fields', { message: 'Enter a username.' });

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const res = await addContact(user.id, username);
    if (!res.ok) return jsonError(422, res.error, { message: addErrorMessage(res.error) });
    return NextResponse.json({ contact: res.contact });
  } catch (e) {
    return errorResponse(e);
  }
}
