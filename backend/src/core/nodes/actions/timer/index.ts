import { ActionNode, ActionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';

/**
 * Action Timer: Déclenche à une date/heure spécifique
 * Paramètres:
 * - date: Date au format DD/MM (ex: "25/12")
 * - time: Heure au format HH:MM (ex: "14:30")
 */
export const timerAction: ActionNode = {
  type: 'action',
  service: 'timer',
  name: 'specific_datetime',
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ActionResult> => {
    const { date, time } = params;

    if (!date && !time) {
      throw new Error('Either date or time parameter is required');
    }

    const now = new Date();
    const currentDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let triggered = false;

    // Vérifier la date si fournie
    if (date && date === currentDate) {
      triggered = true;
    }

    // Vérifier l'heure si fournie
    if (time && time === currentTime) {
      triggered = true;
    }

    // Si les deux sont fournis, les deux doivent correspondre
    if (date && time) {
      triggered = date === currentDate && time === currentTime;
    }

    ctx.logger.debug(`Timer action checked: date=${date}, time=${time}, current=${currentDate} ${currentTime}, triggered=${triggered}`);

    return {
      triggered,
      output: {
        date: currentDate,
        time: currentTime,
        timestamp: now.toISOString(),
      },
    };
  },
};

