import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createEntryInternal } from './actions-logic.ts';

describe('createEntryInternal', () => {
  // Mock Supabase client factory
  const createMockSupabase = (user: any, insertError: any = null) => ({
    auth: {
      getUser: async () => ({ data: { user } })
    },
    from: (table: string) => {
      if (table !== 'entries') {
        throw new Error(`Unexpected table: ${table}`);
      }
      return {
        insert: async (data: any) => ({ error: insertError })
      };
    }
  });

  it('should create an entry with valid content', async () => {
    const user = { id: 'test-user-id' };
    const mockSupabase = createMockSupabase(user);

    const formData = new FormData();
    formData.append('content', 'This is a valid entry');

    await assert.doesNotReject(createEntryInternal(formData, mockSupabase));
  });

  it('should throw error if content is too long', async () => {
    const user = { id: 'test-user-id' };
    const mockSupabase = createMockSupabase(user);

    const formData = new FormData();
    const longContent = 'a'.repeat(241);
    formData.append('content', longContent);

    await assert.rejects(
      createEntryInternal(formData, mockSupabase),
      { message: 'Content invalid' }
    );
  });

  it('should throw error if content is empty', async () => {
    const user = { id: 'test-user-id' };
    const mockSupabase = createMockSupabase(user);

    const formData = new FormData();
    formData.append('content', '');

    await assert.rejects(
      createEntryInternal(formData, mockSupabase),
      { message: 'Content invalid' }
    );
  });

  it('should throw Unauthorized if user is not logged in', async () => {
    const mockSupabase = createMockSupabase(null);

    const formData = new FormData();
    formData.append('content', 'Valid content');

    await assert.rejects(
      createEntryInternal(formData, mockSupabase),
      { message: 'Unauthorized' }
    );
  });

  it('should throw error if database insert fails', async () => {
    const user = { id: 'test-user-id' };
    const insertError = { message: 'DB Error' };
    const mockSupabase = createMockSupabase(user, insertError);

    const formData = new FormData();
    formData.append('content', 'Valid content');

    await assert.rejects(
      createEntryInternal(formData, mockSupabase),
      { message: 'Failed to create entry' }
    );
  });
});
