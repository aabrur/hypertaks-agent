export type EntityKind =
  | "ENT_BOSS"
  | "ENT_SPECIALIST"
  | "ENT_CONTRACT"
  | "ENT_TASK"
  | "ENT_ARTIFACT"
  | "ENT_EVIDENCE_RECORD"
  | "ENT_CONTRADICTION"
  | "ENT_CHECKPOINT";

export type RelationType =
  | "REL_AUTHORIZES"
  | "REL_EXECUTES"
  | "REL_PRODUCES"
  | "REL_DEPENDS_ON"
  | "REL_VERIFIES"
  | "REL_CONTRADICTS"
  | "REL_SUPERSEDES";

export interface ProjectEntity {
  readonly id: string;
  readonly kind: EntityKind;
  readonly label: string;
  readonly attributes: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectRelation {
  readonly id: string;
  readonly type: RelationType;
  readonly sourceEntityId: string;
  readonly targetEntityId: string;
  readonly attributes?: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

export interface OntologyEvent {
  readonly eventId: string;
  readonly eventType:
    | "EVENT_CREATE_ENTITY"
    | "EVENT_UPDATE_ENTITY"
    | "EVENT_RELATE_ENTITIES"
    | "EVENT_CONTRADICT_FACT"
    | "EVENT_INVALIDATE_FACT"
    | "EVENT_ARCHIVE_FACT"
    | "EVENT_RECONCILE_STATE";
  readonly payload: Readonly<Record<string, unknown>>;
  readonly timestamp: string;
  readonly agentId: string;
}

export interface GraphQueryEngine {
  getEntity(id: string): Promise<ProjectEntity | null>;
  getRelations(entityId: string, relationType?: RelationType): Promise<readonly ProjectRelation[]>;
  findContradictions(entityId: string): Promise<readonly ProjectRelation[]>;
  traceProvenance(entityId: string): Promise<readonly ProjectEntity[]>;
}
