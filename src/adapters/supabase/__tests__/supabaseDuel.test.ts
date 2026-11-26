import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRpc, mockFrom, mockChannel, mockRemoveChannel } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
  mockChannel: vi.fn(),
  mockRemoveChannel: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  },
}));

import { supabaseDuel } from '../supabaseDuel';

const SAMPLE_ROW = {
  id: 'd-1',
  code: 'AB12CD',
  classroom_id: 'c-1',
  track: 'mixed',
  wager_xp: 100,
  wager_mode: 'xp',
  status: 'waiting',
  question_ids: ['hw-1-1', 'net-1-1'],
  host_id: 'u-1',
  host_name: 'Ada Lovelace',
  host_ready: false,
  host_score: null,
  host_time_ms: null,
  guest_id: null,
  guest_name: null,
  guest_ready: false,
  guest_score: null,
  guest_time_ms: null,
  started_at: null,
  winner_id: null,
  settled: false,
  bounty_xp: 50,
  full_byte_bonus_xp: 25,
  shield_awarded: true,
  shield_consumed: false,
};

describe('supabaseDuel adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates, joins, sets ready, and submits duel results via RPCs', async () => {
    mockRpc.mockResolvedValueOnce({ data: SAMPLE_ROW, error: null });
    const created = await supabaseDuel.createDuel({
      track: 'mixed',
      wagerXp: 100,
      wagerMode: 'xp',
      questionIds: ['hw-1-1', 'net-1-1'],
      classroomId: 'c-1',
    });
    expect(mockRpc).toHaveBeenCalledWith('create_duel_room', expect.objectContaining({ p_wager_mode: 'xp' }));
    expect(created).toMatchObject({
      id: 'd-1',
      code: 'AB12CD',
      wagerXp: 100,
      wagerMode: 'xp',
      hostName: 'Ada Lovelace',
    });

    mockRpc.mockResolvedValueOnce({
      data: { ...SAMPLE_ROW, guest_id: 'u-2', guest_name: 'Grace Hopper' },
      error: null,
    });
    const joined = await supabaseDuel.joinDuel('ab-12cd');
    expect(mockRpc).toHaveBeenLastCalledWith('join_duel', { p_code: 'AB12CD' });
    expect(joined.guestName).toBe('Grace Hopper');

    mockRpc.mockResolvedValueOnce({
      data: { ...SAMPLE_ROW, status: 'active', host_ready: true, guest_ready: true },
      error: null,
    });
    const active = await supabaseDuel.setReady('d-1', true);
    expect(active.status).toBe('active');

    mockRpc.mockResolvedValueOnce({
      data: { ...SAMPLE_ROW, status: 'finished', winner_id: 'u-1', settled: true },
      error: null,
    });
    const finished = await supabaseDuel.submitResult('d-1', 2, 8500);
    expect(finished).toMatchObject({
      status: 'finished',
      winnerId: 'u-1',
      settled: true,
      bountyXp: 50,
      fullByteBonusXp: 25,
      shieldAwarded: true,
      shieldConsumed: false,
    });
  });

  it('lists open classroom duels waiting for a challenger', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        in: () => ({
          eq: () => ({
            is: () => ({
              order: () => ({
                limit: vi.fn().mockResolvedValue({ data: [SAMPLE_ROW], error: null }),
              }),
            }),
          }),
        }),
      }),
    });

    const open = await supabaseDuel.listOpenClassroomDuels(['c-1']);
    expect(open).toHaveLength(1);
    expect(open[0].code).toBe('AB12CD');
  });

  it('fetches initial duel state and broadcasts sync when realtime channel subscribes', async () => {
    const mockSend = vi.fn();
    const cbBox: { fn?: (status: string) => void } = {};
    const channelObj = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn((cb?: (status: string) => void) => {
        cbBox.fn = cb;
        return channelObj;
      }),
      send: mockSend,
    };
    mockChannel.mockReturnValue(channelObj);

    const activeRow = { ...SAMPLE_ROW, status: 'active', host_ready: true, guest_ready: true };
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: activeRow, error: null }),
        }),
      }),
    });

    const onRoomUpdate = vi.fn();
    const sub = supabaseDuel.subscribeDuel('d-1', {
      onRoomUpdate,
      onOpponentProgress: vi.fn(),
    });

    cbBox.fn?.('SUBSCRIBED');
    await Promise.resolve();
    await Promise.resolve();

    expect(onRoomUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 'd-1', status: 'active' }));
    expect(mockSend).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'sync',
      payload: { duelId: 'd-1' },
    });

    sub.unsubscribe();
    expect(mockRemoveChannel).toHaveBeenCalledWith(channelObj);
  });
});
