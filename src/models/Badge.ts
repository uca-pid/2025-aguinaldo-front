export enum BadgeType {

  EXCEPTIONAL_COMMUNICATOR = 'EXCEPTIONAL_COMMUNICATOR',
  EMPATHETIC_DOCTOR = 'EMPATHETIC_DOCTOR',
  PUNCTUALITY_PROFESSIONAL = 'PUNCTUALITY_PROFESSIONAL',
  SUSTAINED_EXCELLENCE = 'SUSTAINED_EXCELLENCE',

  COMPLETE_DOCUMENTER = 'COMPLETE_DOCUMENTER',
  DETAILED_HISTORIAN = 'DETAILED_HISTORIAN',

  CONSISTENT_PROFESSIONAL = 'CONSISTENT_PROFESSIONAL',
  AGILE_RESPONDER = 'AGILE_RESPONDER',

  RELATIONSHIP_BUILDER = 'RELATIONSHIP_BUILDER',
  
  TOP_SPECIALIST = 'TOP_SPECIALIST',
  MEDICAL_LEGEND = 'MEDICAL_LEGEND',
  ALWAYS_AVAILABLE = 'ALWAYS_AVAILABLE',
}

export enum BadgeCategory {
  QUALITY_OF_CARE = 'QUALITY_OF_CARE',
  DOCUMENTATION = 'DOCUMENTATION',
  PROFESSIONALISM = 'PROFESSIONALISM',
  RELATIONSHIPS = 'RELATIONSHIPS',
  ACHIEVEMENT = 'ACHIEVEMENT',
}

export enum BadgeRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export interface Badge {
  id: string;
  doctorId: string;
  badgeType: BadgeType;
  earnedAt: string;
  isActive: boolean;
  lastEvaluatedAt: string;
}

export interface BadgeProgress {
  badgeType: BadgeType;
  badgeName: string;
  category: BadgeCategory;
  earned: boolean;
  progressPercentage: number;
  description: string;
  statusMessage: string;
}

export interface BadgeMetadata {
  type: BadgeType;
  category: BadgeCategory;
  rarity: BadgeRarity;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
}

export interface DoctorBadgesResponse {
  doctorId: string;
  doctorName: string;
  totalActiveBadges: number;
  qualityOfCareBadges: BadgeDTO[];
  professionalismBadges: BadgeDTO[];
  consistencyBadges: BadgeDTO[];
}

export interface BadgeDTO {
  badgeType: BadgeType;
  category: string;
  isActive: boolean;
  earnedAt: string;
  lastEvaluatedAt: string;
}

export type BadgeProgressResponse = BadgeProgress[];

export interface BadgeStats {
  totalEarned: number;
  totalAvailable: number;
  completionPercentage: number;
  recentlyEarned: Badge[];
  closestToEarn: BadgeProgress[];
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
  path?: string;
}

export const BADGE_METADATA: Record<BadgeType, BadgeMetadata> = {
  [BadgeType.EXCEPTIONAL_COMMUNICATOR]: {
    type: BadgeType.EXCEPTIONAL_COMMUNICATOR,
    category: BadgeCategory.QUALITY_OF_CARE,
    rarity: BadgeRarity.RARE,
    name: 'Comunicador Excepcional',
    description: 'Reconocido por su excelente comunicación con pacientes',
    icon: '💬',
    color: '#4CAF50',
    criteria: '40+ evaluaciones destacadas en comunicación en las últimas 50 consultas'
  },
  [BadgeType.EMPATHETIC_DOCTOR]: {
    type: BadgeType.EMPATHETIC_DOCTOR,
    category: BadgeCategory.QUALITY_OF_CARE,
    rarity: BadgeRarity.RARE,
    name: 'Doctor Empático',
    description: 'Destaca por su empatía y comprensión hacia los pacientes',
    icon: '❤️',
    color: '#E91E63',
    criteria: '40+ evaluaciones destacadas en empatía en las últimas 50 consultas'
  },
  [BadgeType.PUNCTUALITY_PROFESSIONAL]: {
    type: BadgeType.PUNCTUALITY_PROFESSIONAL,
    category: BadgeCategory.QUALITY_OF_CARE,
    rarity: BadgeRarity.COMMON,
    name: 'Profesional Puntual',
    description: 'Siempre a tiempo, respetando el horario de los pacientes',
    icon: '⏰',
    color: '#2196F3',
    criteria: '40+ evaluaciones destacadas en puntualidad en las últimas 50 consultas'
  },
  [BadgeType.SUSTAINED_EXCELLENCE]: {
    type: BadgeType.SUSTAINED_EXCELLENCE,
    category: BadgeCategory.QUALITY_OF_CARE,
    rarity: BadgeRarity.EPIC,
    name: 'Excelencia Sostenida',
    description: 'Mantiene consistentemente altas calificaciones',
    icon: '⭐',
    color: '#FF9800',
    criteria: 'Calificación promedio ≥4.7 en las últimas 100 consultas con menos de 5 calificaciones bajas'
  },
  [BadgeType.COMPLETE_DOCUMENTER]: {
    type: BadgeType.COMPLETE_DOCUMENTER,
    category: BadgeCategory.DOCUMENTATION,
    rarity: BadgeRarity.COMMON,
    name: 'Documentador Completo',
    description: 'Documenta exhaustivamente cada consulta',
    icon: '📋',
    color: '#607D8B',
    criteria: 'Documentación completa en 45+ de las últimas 50 consultas'
  },
  [BadgeType.DETAILED_HISTORIAN]: {
    type: BadgeType.DETAILED_HISTORIAN,
    category: BadgeCategory.DOCUMENTATION,
    rarity: BadgeRarity.RARE,
    name: 'Historiador Detallado',
    description: 'Crea historiales médicos excepcionalmente detallados',
    icon: '📚',
    color: '#795548',
    criteria: 'Promedio de 200+ palabras por entrada en las últimas 30 consultas documentadas'
  },
  [BadgeType.CONSISTENT_PROFESSIONAL]: {
    type: BadgeType.CONSISTENT_PROFESSIONAL,
    category: BadgeCategory.PROFESSIONALISM,
    rarity: BadgeRarity.RARE,
    name: 'Profesional Consistente',
    description: 'Mantiene un alto nivel de profesionalismo consistente',
    icon: '🎯',
    color: '#3F51B5',
    criteria: 'Alta tasa de finalización: 90+ consultas completadas en últimos 90 días, máx. 5% cancelaciones'
  },
  [BadgeType.AGILE_RESPONDER]: {
    type: BadgeType.AGILE_RESPONDER,
    category: BadgeCategory.PROFESSIONALISM,
    rarity: BadgeRarity.COMMON,
    name: 'Respondedor Ágil',
    description: 'Responde rápidamente a solicitudes de modificación',
    icon: '⚡',
    color: '#FFC107',
    criteria: 'Respuesta a 9+ de las últimas 10 solicitudes de modificación'
  },
  [BadgeType.RELATIONSHIP_BUILDER]: {
    type: BadgeType.RELATIONSHIP_BUILDER,
    category: BadgeCategory.RELATIONSHIPS,
    rarity: BadgeRarity.EPIC,
    name: 'Constructor de Relaciones',
    description: 'Construye relaciones duraderas con sus pacientes',
    icon: '🤝',
    color: '#00BCD4',
    criteria: '50+ pacientes atendidos con 60%+ de pacientes recurrentes'
  },
  [BadgeType.TOP_SPECIALIST]: {
    type: BadgeType.TOP_SPECIALIST,
    category: BadgeCategory.ACHIEVEMENT,
    rarity: BadgeRarity.EPIC,
    name: 'Especialista Destacado',
    description: 'Entre los mejores especialistas de su área',
    icon: '🏆',
    color: '#FF5722',
    criteria: 'Dentro del top 10% de calificación en su especialidad'
  },
  [BadgeType.MEDICAL_LEGEND]: {
    type: BadgeType.MEDICAL_LEGEND,
    category: BadgeCategory.ACHIEVEMENT,
    rarity: BadgeRarity.LEGENDARY,
    name: 'Leyenda Médica',
    description: 'Ha alcanzado el más alto nivel de reconocimiento',
    icon: '👑',
    color: '#9C27B0',
    criteria: '10+ logros obtenidos, excelencia en todas las áreas'
  },
  [BadgeType.ALWAYS_AVAILABLE]: {
    type: BadgeType.ALWAYS_AVAILABLE,
    category: BadgeCategory.ACHIEVEMENT,
    rarity: BadgeRarity.RARE,
    name: 'Siempre Disponible',
    description: 'Ofrece amplia disponibilidad para sus pacientes',
    icon: '🌟',
    color: '#8BC34A',
    criteria: 'Disponibilidad configurada en 5+ días de la semana'
  },
};

export const getBadgeMetadata = (type: BadgeType): BadgeMetadata => {
  return BADGE_METADATA[type];
};

export const getBadgesByCategory = (category: BadgeCategory): BadgeMetadata[] => {
  return Object.values(BADGE_METADATA).filter(badge => badge.category === category);
};

export const getRarityColor = (rarity: BadgeRarity): string => {
  const colors: Record<BadgeRarity, string> = {
    [BadgeRarity.COMMON]: '#78909C',
    [BadgeRarity.RARE]: '#2196F3',
    [BadgeRarity.EPIC]: '#9C27B0',
    [BadgeRarity.LEGENDARY]: '#FFD700',
  };
  return colors[rarity];
};

export const getCategoryDisplayName = (category: BadgeCategory): string => {
  const names: Record<BadgeCategory, string> = {
    [BadgeCategory.QUALITY_OF_CARE]: 'Calidad de Atención',
    [BadgeCategory.DOCUMENTATION]: 'Documentación',
    [BadgeCategory.PROFESSIONALISM]: 'Profesionalismo',
    [BadgeCategory.RELATIONSHIPS]: 'Relaciones',
    [BadgeCategory.ACHIEVEMENT]: 'Logros',
  };
  return names[category];
};

export const getRarityDisplayName = (rarity: BadgeRarity): string => {
  const names: Record<BadgeRarity, string> = {
    [BadgeRarity.COMMON]: 'Común',
    [BadgeRarity.RARE]: 'Raro',
    [BadgeRarity.EPIC]: 'Épico',
    [BadgeRarity.LEGENDARY]: 'Legendario',
  };
  return names[rarity];
};
