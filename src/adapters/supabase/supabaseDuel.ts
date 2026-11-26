import type { DuelService, DuelSubscription } from '../../application/ports';
import { generateJoinCode, isValidJoinCode, normalizeJoinCode } from '../../domain/rules/classroom';
import type { DuelProgressEvent, DuelRoom, DuelStatus, DuelTrack, DuelWagerMode } from '../../domain/rules/duel';
import { supabase } from './supabaseClient';

function mapDuelRow(row: Record<string, unknown>): DuelRoom {
  const trackRaw = String(row.track ?? 'mixed');
  const track: DuelTrack = trackRaw === 'hw' || trackRaw === 'net' ? trackRaw : 'mixed';
  const statusRaw = String(row.status ?? 'waiting');
  const status: DuelStatus =
    statusRaw === 'active' || statusRaw === 'finished' || statusRaw === 'cancelled'
      ? statusRaw
      : 'waiting';

  const wagerMode: DuelWagerMode = row.wager_mode === 'streak' ? 'streak' : 'xp';

  return {
    id: String(row.id),
    code: String(row.code),
    classroomId: typeof row.classroom_id === 'string' ? row.classroom_id : null,
    track,
    wagerXp: Math.max(0, Number(row.wager_xp) || 0),
    wagerMode,
    status,
    questionIds: Array.isArray(row.question_ids)
      ? row.question_ids.filter((q): q is string => typeof q === 'string')
      : [],
    hostId: String(row.host_id),
    hostName: String(row.host_name || 'Learner'),
    hostReady: Boolean(row.host_ready),
    hostScore: row.host_score === null || row.host_score === undefined ? null : Number(row.host_score),
    hostTimeMs:
      row.host_time_ms === null || row.host_time_ms === undefined ? null : Number(row.host_time_ms),
    guestId: typeof row.guest_id === 'string' ? row.guest_id : null,
    guestName: typeof row.guest_name === 'string' ? row.guest_name : null,
    guestReady: Boolean(row.guest_ready),
    guestScore:
      row.guest_score === null || row.guest_score === undefined ? null : Number(row.guest_score),
    guestTimeMs:
      row.guest_time_ms === null || row.guest_time_ms === undefined ? null : Number(row.guest_time_ms),
    startedAt: typeof row.started_at === 'string' ? row.started_at : null,
    winnerId: typeof row.winner_id === 'string' ? row.winner_id : null,
    settled: Boolean(row.settled),
    bountyXp: Math.max(0, Number(row.bounty_xp) || 0),
    fullByteBonusXp: Math.max(0, Number(row.full_byte_bonus_xp) || 0),
    shieldAwarded: Boolean(row.shield_awarded),
    shieldConsumed: Boolean(row.shield_consumed),
  };
}

export const supabaseDuel: DuelService = {
  async createDuel(opts) {
    if (!supabase) {
      throw new Error('Sign in with Google to play live duels.');
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const code = generateJoinCode();
      const { data, error } = await supabase.rpc('create_duel_room', {
        p_code: code,
        p_track: opts.track,
        p_wager_xp: opts.wagerMode === 'streak' ? 0 : opts.wagerXp,
        p_question_ids: opts.questionIds,
        p_classroom_id: opts.classroomId,
        p_wager_mode: opts.wagerMode,
      });

      if (!error && data) {
        return mapDuelRow(data as Record<string, unknown>);
      }
      if (error?.code !== '23505') {
        throw new Error(error?.message || 'Could not create duel room.');
      }
    }

    throw new Error('Could not create duel room. Please try again.');
  },

  async joinDuel(rawCode) {
    if (!supabase) {
      throw new Error('Sign in with Google to play live duels.');
    }
    const code = normalizeJoinCode(rawCode);
    if (!isValidJoinCode(code)) {
      throw new Error('Enter a 6-character duel room code.');
    }

    const { data, error } = await supabase.rpc('join_duel', { p_code: code });
    if (error || !data) {
      throw new Error(error?.message || 'Could not join duel.');
    }
    return mapDuelRow(data as Record<string, unknown>);
  },

  async getDuel(duelId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('duels')
      .select('*')
      .eq('id', duelId)
      .maybeSingle();

    if (error || !data) return null;
    return mapDuelRow(data as Record<string, unknown>);
  },

  async listOpenClassroomDuels(classroomIds) {
    if (!supabase || classroomIds.length === 0) return [];
    const { data, error } = await supabase
      .from('duels')
      .select('*')
      .in('classroom_id', classroomIds)
      .eq('status', 'waiting')
      .is('guest_id', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map(mapDuelRow);
  },

  async setReady(duelId, ready) {
    if (!supabase) {
      throw new Error('Sign in with Google to play live duels.');
    }
    const { data, error } = await supabase.rpc('set_duel_ready', {
      p_duel_id: duelId,
      p_ready: ready,
    });
    if (error || !data) {
      throw new Error(error?.message || 'Could not update ready state.');
    }
    return mapDuelRow(data as Record<string, unknown>);
  },

  async submitResult(duelId, score, timeMs) {
    if (!supabase) {
      throw new Error('Sign in with Google to submit duel score.');
    }
    const { data, error } = await supabase.rpc('submit_duel_result', {
      p_duel_id: duelId,
      p_score: score,
      p_time_ms: timeMs,
    });
    if (error || !data) {
      throw new Error(error?.message || 'Could not submit duel score.');
    }
    return mapDuelRow(data as Record<string, unknown>);
  },

  async cancelOrForfeitDuel(duelId) {
    if (!supabase) {
      throw new Error('Sign in with Google to leave duel.');
    }
    const { data, error } = await supabase.rpc('cancel_or_forfeit_duel', {
      p_duel_id: duelId,
    });
    if (error || !data) {
      throw new Error(error?.message || 'Could not leave duel.');
    }
    return mapDuelRow(data as Record<string, unknown>);
  },

  subscribeDuel(duelId, handlers): DuelSubscription {
    if (!supabase) {
      return {
        sendProgress: () => undefined,
        notifySync: () => undefined,
        unsubscribe: () => undefined,
      };
    }

    const client = supabase;
    const channel = client
      .channel(`duel:${duelId}`)
      .on('broadcast', { event: 'progress' }, (msg) => {
        const payload = msg?.payload as DuelProgressEvent | undefined;
        if (payload && typeof payload.userId === 'string') {
          handlers.onOpponentProgress(payload);
        }
      })
      .on('broadcast', { event: 'sync' }, () => {
        void this.getDuel(duelId)
          .then((room) => {
            if (room) handlers.onRoomUpdate(room);
          })
          .catch(() => undefined);
      })
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'duels', filter: `id=eq.${duelId}` },
        (payload) => {
          if (payload.new) {
            handlers.onRoomUpdate(mapDuelRow(payload.new as Record<string, unknown>));
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void this.getDuel(duelId)
            .then((room) => {
              if (room) handlers.onRoomUpdate(room);
            })
            .catch(() => undefined);
          void channel.send({ type: 'broadcast', event: 'sync', payload: { duelId } });
        }
      });

    return {
      sendProgress: (progress) => {
        void channel.send({ type: 'broadcast', event: 'progress', payload: progress });
      },
      notifySync: () => {
        void channel.send({ type: 'broadcast', event: 'sync', payload: { duelId } });
      },
      unsubscribe: () => {
        void client.removeChannel(channel);
      },
    };
  },
};
