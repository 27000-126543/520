import { v4 as uuidv4 } from 'uuid';
import { store } from '../data/store';
import { spyService } from './SpyService';
import { organizationService } from './OrganizationService';
import type {
  Mission, MissionExecution, MissionEvent, MissionStatus,
  EventType, EventOutcome, PlayerAction, Spy, IntelScroll
} from '../../shared/types';

const EVENT_TYPES: EventType[] = ['patrol', 'betrayal', 'discovery', 'trap', 'opportunity'];

const EVENT_DESCRIPTIONS: Record<EventType, string[]> = {
  patrol: ['遭遇巡逻队！', '守卫加强了警戒', '发现了隐藏的哨兵'],
  betrayal: ['间谍忠诚度下降！', '有人泄密了情报', '间谍被策反了'],
  discovery: ['行动被发现了！', '触发了警报', '守卫注意到异常'],
  trap: ['这是一个陷阱！', '中了埋伏', '触发了魔法结界'],
  opportunity: ['发现了绝佳机会！', '找到了秘密通道', '获得了额外情报']
};

export class MissionEngine {
  private io: any;

  setSocketIO(io: any) {
    this.io = io;
  }

  calculateSuccessRate(missionId: string, spyIds: string[], orgId: string): number {
    const mission = store.getMission(missionId);
    if (!mission) throw new Error('任务不存在');

    const spies = spyIds.map(id => store.getSpy(id)).filter(Boolean) as Spy[];
    if (spies.length === 0) throw new Error('未选择间谍');

    const guild = store.getGuildByMember(orgId);
    const guildBonus = guild?.buildings.find(b => b.type === 'intelStation')?.bonus || 0;

    return store.calculateSuccessRate(mission, spies, guildBonus);
  }

  acceptMission(missionId: string, spyIds: string[], orgId: string, orgName: string): MissionExecution {
    const mission = store.getMission(missionId);
    if (!mission) throw new Error('任务不存在');

    const spies = spyIds.map(id => store.getSpy(id)).filter(Boolean) as Spy[];
    if (spies.length === 0) throw new Error('未选择间谍');

    const busySpies = spies.filter(s => s.status !== 'idle');
    if (busySpies.length > 0) {
      throw new Error(`间谍 ${busySpies.map(s => s.name).join(', ')} 正在执行其他任务`);
    }

    const successRate = this.calculateSuccessRate(missionId, spyIds, orgId);

    const execution: MissionExecution = {
      id: uuidv4(),
      missionId,
      organizationId: orgId,
      spyIds,
      startTime: new Date(),
      endTime: null,
      progress: 0,
      currentSuccessRate: successRate,
      status: 'in_progress',
      perfection: 0,
      events: [],
      realtimeStats: {
        concealment: Math.min(...spies.map(s => s.stats.concealment)),
        detectionRisk: Math.max(...spies.map(s => s.stats.detectionRisk)),
        stamina: Math.min(...spies.map(s => s.stats.stamina))
      }
    };

    store.createExecution(execution);

    spies.forEach(spy => {
      spyService.setSpyStatus(spy.id, 'mission');
    });

    this.startExecutionLoop(execution, mission, spies);

    return execution;
  }

  private startExecutionLoop(execution: MissionExecution, mission: Mission, spies: Spy[]) {
    const startTime = Date.now();
    const duration = mission.timeLimit * 1000;

    const eventCallback = (event: MissionEvent) => {
      if (this.io) {
        this.io.to(`execution:${execution.id}`).emit('missionEvent', event);
      }
    };
    store.setEventCallback(execution.id, eventCallback);

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);

      const staminaDecay = 0.5 + Math.random() * 0.5;
      const detectionIncrease = Math.random() * 0.3;
      const concealmentDecay = Math.random() * 0.2;

      let newConcealment = execution.realtimeStats.concealment - concealmentDecay;
      let newDetectionRisk = execution.realtimeStats.detectionRisk + detectionIncrease;
      let newStamina = execution.realtimeStats.stamina - staminaDecay;

      let successRateChange = 0;
      if (newStamina < 30) successRateChange -= 5;
      if (newDetectionRisk > 70) successRateChange -= 10;
      if (newConcealment < 30) successRateChange -= 5;

      spies.forEach(spy => {
        spyService.updateSpyStats(spy.id, {
          stamina: Math.max(0, spy.stats.stamina - staminaDecay / spies.length),
          detectionRisk: Math.min(100, spy.stats.detectionRisk + detectionIncrease / spies.length),
          concealment: Math.max(0, spy.stats.concealment - concealmentDecay / spies.length)
        });
      });

      if (Math.random() < 0.08 && execution.events.filter(e => !e.resolved).length < 2) {
        this.triggerRandomEvent(execution, spies);
      }

      const unresolvedEvents = execution.events.filter(e => !e.resolved);
      if (unresolvedEvents.length > 0) {
        successRateChange -= unresolvedEvents.length * 3;
      }

      const updatedExecution = store.updateExecution(execution.id, {
        progress,
        currentSuccessRate: Math.max(5, Math.min(95, execution.currentSuccessRate + successRateChange * 0.01)),
        realtimeStats: {
          concealment: Math.max(0, Math.min(100, newConcealment)),
          detectionRisk: Math.max(0, Math.min(100, newDetectionRisk)),
          stamina: Math.max(0, Math.min(100, newStamina))
        }
      });

      if (this.io) {
        this.io.to(`execution:${execution.id}`).emit('executionUpdate', updatedExecution);
      }

      if (progress >= 100 || newStamina <= 0) {
        this.completeMission(execution.id, mission);
      }
    }, 500);

    store.setExecutionTimer(execution.id, timer);
  }

  private triggerRandomEvent(execution: MissionExecution, spies: Spy[]) {
    const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const descriptions = EVENT_DESCRIPTIONS[eventType];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    const event: MissionEvent = {
      id: uuidv4(),
      type: eventType,
      timestamp: new Date(),
      description,
      resolved: false,
      outcome: 'neutral'
    };

    store.addExecutionEvent(execution.id, event);
    store.triggerEvent(execution.id, event);
  }

  handlePlayerAction(executionId: string, eventId: string, action: PlayerAction): MissionEvent | null {
    const execution = store.getExecution(executionId);
    if (!execution) return null;

    const event = execution.events.find(e => e.id === eventId);
    if (!event || event.resolved) return null;

    let outcome: EventOutcome = 'neutral';
    let successRateChange = 0;

    if (action === 'support') {
      const supportSuccess = Math.random() < 0.7;
      if (supportSuccess) {
        outcome = 'positive';
        successRateChange = 10;
        event.description += ' 援护成功！';
      } else {
        outcome = 'negative';
        successRateChange = -5;
        event.description += ' 援护失败，反而引起了注意...';
      }
    } else if (action === 'destroy') {
      const destroySuccess = Math.random() < 0.8;
      if (destroySuccess) {
        outcome = 'neutral';
        successRateChange = 0;
        event.description += ' 证据已销毁，危机解除。';
      } else {
        outcome = 'negative';
        successRateChange = -10;
        event.description += ' 销毁失败，暴露风险增加！';
      }
    }

    event.resolved = true;
    event.playerAction = action;
    event.outcome = outcome;

    store.updateExecution(executionId, {
      currentSuccessRate: Math.max(5, Math.min(95, execution.currentSuccessRate + successRateChange))
    });

    return event;
  }

  private completeMission(executionId: string, mission: Mission) {
    const execution = store.getExecution(executionId);
    if (!execution) return;

    store.clearExecutionTimer(executionId);
    store.clearEventCallback(executionId);

    const success = Math.random() * 100 < execution.currentSuccessRate;
    const status: MissionStatus = success ? 'completed' : 'failed';

    let perfection = 0;
    if (success) {
      const unresolvedPenalty = execution.events.filter(e => !e.resolved).length * 5;
      const staminaBonus = execution.realtimeStats.stamina * 0.2;
      const concealmentBonus = execution.realtimeStats.concealment * 0.3;
      perfection = Math.min(100, Math.max(0,
        70 + execution.currentSuccessRate * 0.3 - unresolvedPenalty + staminaBonus + concealmentBonus
      ));
    }

    store.updateExecution(executionId, {
      status,
      perfection,
      endTime: new Date()
    });

    execution.spyIds.forEach(spyId => {
      const spy = store.getSpy(spyId);
      if (spy) {
        const newStatus = success ? 'idle' : (spy.stats.health < 30 ? 'injured' : 'idle');
        spyService.setSpyStatus(spyId, newStatus);
        if (!success) {
          spyService.updateSpyStats(spyId, {
            health: Math.max(0, spy.stats.health - 20 - Math.random() * 20)
          });
        }
      }
    });

    let rewardScrolls: IntelScroll[] = [];
    let resultIntelPoints = 0;
    let resultReputation = 0;
    let resultExposureRisk = 0;

    if (success) {
      resultIntelPoints = Math.floor(mission.rewards.intelPoints * (perfection / 100));
      resultReputation = Math.floor(mission.rewards.reputation * (perfection / 100));
      organizationService.addIntelPoints(execution.organizationId, resultIntelPoints);
      organizationService.updateReputation(execution.organizationId, resultReputation);
      rewardScrolls = store.distributeMissionRewards(
        execution.organizationId,
        mission.rewards,
        perfection
      );

      if (perfection >= 90) {
        const org = store.getOrganization(execution.organizationId);
        const achievementAnn = {
          id: Date.now().toString(),
          type: 'achievement' as const,
          message: `恭喜【${org?.name || '未知组织'}】完成任务【${mission.title}】，完美度 ${perfection.toFixed(0)}%！`,
          timestamp: new Date()
        };
        store.addAnnouncement(achievementAnn);
        if (this.io) {
          this.io.emit('announcement:new', achievementAnn);
        }
      }
    } else {
      resultReputation = -mission.penalties.reputationLoss;
      resultExposureRisk = mission.penalties.exposureIncrease;
      organizationService.updateReputation(execution.organizationId, resultReputation);
      organizationService.updateExposureRisk(execution.organizationId, resultExposureRisk);
    }

    store.updateExecution(executionId, {
      result: {
        success,
        perfection,
        intelPoints: resultIntelPoints,
        reputation: resultReputation,
        exposureRisk: resultExposureRisk,
        scrolls: rewardScrolls.map(s => ({ id: s.id, name: s.name, rarity: s.rarity }))
      }
    });

    if (this.io) {
      this.io.to(`execution:${executionId}`).emit('missionComplete', {
        executionId,
        missionId: mission.id,
        missionTitle: mission.title,
        success,
        perfection,
        intelPoints: resultIntelPoints,
        reputation: resultReputation,
        scrolls: rewardScrolls.map(s => ({ id: s.id, name: s.name, rarity: s.rarity })),
        exposureRisk: resultExposureRisk
      });
    }
  }

  getMissions(): Mission[] {
    return store.getMissions();
  }

  getMission(id: string): Mission | null {
    return store.getMission(id) || null;
  }

  getExecution(id: string): MissionExecution | null {
    return store.getExecution(id) || null;
  }

  getExecutions(orgId: string): MissionExecution[] {
    return store.getExecutions(orgId);
  }

  refreshMissions(): Mission[] {
    return store.refreshMissions();
  }
}

export const missionEngine = new MissionEngine();
