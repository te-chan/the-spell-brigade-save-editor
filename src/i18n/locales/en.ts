export const en = {
  app: {
    title: 'Save Editor',
    metaTitle: 'The Spell Brigade - Save Editor | Edit Your Game Saves Online',
    metaDescription:
      'Free online save editor for The Spell Brigade. Easily edit your game saves, modify gold, character levels, and achievements. No download required.',
  },
  language: {
    label: 'Language',
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
  },
  drop: {
    step1: '1. save_meta',
    step2: '2. save_slot_N',
    skipMeta: "Skip — I'll pick the slot file directly",
    activeSlot: 'Active slot',
    change: 'Change',
    skippedMeta: 'Skipped save_meta — pick any save_slot_N file below.',
    useMeta: 'Use save_meta',
    saveLocationLabel: 'Save file location:',
    saveLocationHint: 'Press Win+R → paste the path → Enter to open the folder',
    copyPath: 'Copy path',
    loadData: 'Load Data',
    exportSave: 'Export Save',
    slotMismatch:
      'You picked save_slot_{picked} but the active slot is {active}. Editing it is still fine — just won\'t be the one the game loads by default.',
    slotUnknownName:
      '"{name}" doesn\'t look like a save_slot_N file. Continuing anyway.',
  },
  dropzone: {
    loading: 'Loading...',
    metaHeadline: 'Drop your save_meta file',
    metaSubline: 'Tells the editor which slot is currently active',
    slotHeadline: 'Drop a save_slot_N file',
    slotHeadlineActive: 'Drop save_slot_{slot} (your active slot)',
    slotSubline: 'Pick the slot you want to edit',
    slotSublineActive: 'Active slot detected: {slot} — any save_slot_N also works',
    legacyHeadline: 'Drop your save_slot_N file here',
    legacySubline: 'or tap to browse your device — legacy .es3 saves also supported',
    selectFile: 'Select File',
  },
  fileInfo: {
    currentFile: 'Current File',
    statusReady: 'Ready',
    statusLoading: 'Loading...',
    statusError: 'Error',
    statusIdle: 'No file',
    noFileSelected: 'No file selected',
    unknownFile: 'Unknown file',
    modifiedLabel: 'Modified',
    today: 'Today {time}',
  },
  edit: {
    save: 'Save',
    globalResources: 'Global Resources',
    readOnlyMeta: 'Read-only metadata',
    brigadeMembers: 'Brigade Members',
    unlockedCount: '{count} Unlocked',
    lockedCount: '{count} Locked',
    achievements: 'Achievements',
    unlockAll: 'Unlock All',
    lockAll: 'Lock All',
    resetChanges: 'Reset Changes',
    noSaveLoaded: 'No save data loaded',
    goBack: 'Go Back',
  },
  number: {
    maxOut: 'Max out',
    min: 'Min: {value}',
    max: 'Max: {value}',
  },
  level: {
    label: 'Level',
    maxReached: 'Max Level Reached',
    max: 'Max {value}',
  },
  character: {
    classLabel: 'Class',
    idLabel: 'ID',
    costLabel: 'Cost',
    locked: 'Locked',
    maxLevelTitle: 'Max Level',
    prestige: 'Prestige',
    decrementPrestige: 'Decrement prestige',
    incrementPrestige: 'Increment prestige',
    unlockButton: 'Unlock {name}',
    unlockHint: 'Adds the rank entry only — Gold is NOT deducted',
    skinIdTitle: 'Skin ID: {id}',
    unlocked: 'unlocked',
  },
  gold: {
    label: 'Gold Coins',
  },
  achievement: {
    categoryRelics: 'Relics',
    categoryWizards: 'Wizards',
    categoryMission: 'Missions',
    categoryMics: 'Miscellaneous',
    categoryOutfits: 'Outfits',
  },
  dialog: {
    confirmTitle: 'Confirm',
    confirm: 'Confirm',
    cancel: 'Cancel',
    warningTitle: 'Warning',
    warningMessage:
      'This data may cause unexpected game behavior or significantly disrupt your game experience. Also, this data does not represent your actual skill. Do you acknowledge this?',
    understand: 'I Understand',
  },
  errors: {
    metaNoActiveSlot: 'Could not find active_slot in this file. Is it really save_meta?',
    metaDecryptFailed: 'Failed to decrypt this file as save_meta.',
  },
} as const;

// 値型を string に広げた型 — `TKey` のパス推論には `typeof en` を使い、
// 翻訳辞書には Widen を適用してリテラル一致の縛りを外す。
type Widen<T> = T extends string
  ? string
  : T extends Record<string, unknown>
    ? { [K in keyof T]: Widen<T[K]> }
    : T;

export type Dict = Widen<typeof en>;
