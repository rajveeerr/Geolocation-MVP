import request from 'supertest';
import app from '../src/app';

// We'll mock sendEmail to capture calls without performing real HTTP requests
jest.mock('../src/lib/email', () => {
  const original = jest.requireActual('../src/lib/email');
  return {
    ...original,
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };
});

import { sendEmail } from '../src/lib/email';

describe('Welcome Email', () => {
  it('sends a welcome email after successful registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'welcome@test.com', password: 'Password123!' });

    expect(res.status).toBe(201);

    // Assert our mocked sendEmail was called with welcome tag
    expect(sendEmail).toHaveBeenCalled();
    const found = (sendEmail as jest.Mock).mock.calls.find((c) => Array.isArray(c) && c[0]?.tags?.includes('welcome'));
    expect(found).toBeTruthy();
    expect(found[0].to).toMatchObject({ email: 'welcome@test.com' });
  });
});
