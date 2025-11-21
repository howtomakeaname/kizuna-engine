

export const translations = {
  en: {
    start: {
      title: "KIZUNA",
      subtitle: "Infinite Visual Novel",
      newGame: "Start New Game",
      load: "Load",
      gallery: "Gallery",
      config: "Config",
      poweredBy: "Powered by",
      enterName: "Enter Your Name",
      namePlaceholder: "Protagonist",
      startJourney: "Start Journey",
      loading: "Weaving your destiny...",
      preparing: "Summoning heroines...",
    },
    config: {
        title: "Engine Configuration",
        provider: "AI Provider",
        gemini: {
            key: "Gemini API Key",
            desc: "Get free key from AI Studio (Google)"
        },
        siliconflow: {
            key: "SiliconFlow API Key",
            model: "Text Model",
            imageModel: "Image Model",
            desc: "DeepSeek & Qwen models"
        },
        custom: {
            textApiUrl: "Text API URL",
            textApiKey: "Text API Key (Optional)",
            textModel: "Text Model Name",
            imageApiUrl: "Image API URL (Optional)",
            imageModel: "Image Model Name (Optional)",
            desc: "Compatible with OpenAI format (Ollama, vLLM, etc.)"
        },
        dev: {
            title: "Developer Mode",
            enable: "Enable Developer Mode",
            warning: "Advanced: Modifying prompts may break game logic. Use with caution.",
            promptType: "Prompt Type",
            editor: "Prompt Editor",
            save: "Save Version",
            history: "History / Restore",
            reset: "Load Default",
            types: {
                initial: "Initial Scene",
                next: "Next Scene",
                secret: "Secret Memory",
                image: "Image Generation"
            },
            savedToast: "Prompt version saved!",
            restoredToast: "Version restored!"
        },
        save: "Save Configuration",
        cancel: "Cancel",
        saved: "Settings Saved!"
    },
    theme: {
      title: "Select Story Theme",
      desc: "Choose the setting for your visual novel adventure:",
      custom: "Custom Scenario",
      customPlaceholder: "E.g. Cyberpunk Detective, Zombie Survival...",
      cancel: "Cancel",
      start: "Next", 
      names: {
        "Japanese High School": "Japanese High School",
        "School & Magic Academy": "School & Magic Academy",
        "Cat Girl & Maid Cafe": "Cat Girl & Maid Cafe",
        "Isekai Fantasy Adventure": "Isekai Fantasy Adventure",
        "Cyberpunk Dystopia": "Cyberpunk Dystopia",
        "Post-Apocalyptic Survival": "Post-Apocalyptic Survival",
        "Sci-Fi Space Opera": "Sci-Fi Space Opera",
        "Historical Dynasty": "Historical Dynasty",
        "Mythological Fantasy": "Mythological Fantasy",
        "Supernatural Horror": "Supernatural Horror",
      }
    },
    game: {
      turn: "Turn",
      skip: "Skip",
      skipping: "Skipping",
      log: "Log",
      auto: "Auto",
      hideUi: "Hide UI",
      specialEvent: "SPECIAL EVENT",
      menu: "Menu",
      generatingImage: "Generating new background...",
      download: "Download"
    },
    menu: {
      title: "SYSTEM MENU",
      tabs: {
        heroines: "Heroines",
        items: "Items",
        system: "System"
      },
      actions: {
        save: "Save Game",
        saveDesc: "Record your progress manually.",
        load: "Load Game",
        loadDesc: "Return to a previous timeline.",
        gallery: "Memory Gallery",
        galleryDesc: "View unlocked CGs and Events.",
        unlock: "Unlock Special Memory",
        unlocking: "Reading Memory...",
      },
      settings: {
        audio: "Audio Settings",
        volume: "Master Volume",
        mute: "Mute All Sound",
        playerName: "Player Name",
        changeName: "Update Name"
      },
      emptyBag: "Your bag is empty."
    },
    gallery: {
      title: "Event CG Gallery",
      loading: "Loading Memories...",
      empty: "No memories unlocked yet.",
      emptyDesc: "Play the story to unlock special events.",
      close: "Close"
    },
    saveload: {
      saveTitle: "Save Game",
      loadTitle: "Load Game",
      autoSave: "Auto Save",
      empty: "Empty Slot",
      noData: "No Data",
      deleteConfirm: "Are you sure you want to delete this save?",
      saveHere: "Save Here",
      loadGame: "Load Game"
    }
  },
  zh: {
    start: {
      title: "羁绊",
      subtitle: "无限视觉小说引擎",
      newGame: "开始新游戏",
      load: "读取进度",
      gallery: "画廊",
      config: "设置",
      poweredBy: "技术支持",
      enterName: "输入你的名字",
      namePlaceholder: "主人公",
      startJourney: "开启旅程",
      loading: "正在编织命运...",
      preparing: "正在召唤女主角...",
    },
    config: {
        title: "引擎配置",
        provider: "AI 提供商",
        gemini: {
            key: "Gemini API Key",
            desc: "从 Google AI Studio 获取免费 Key"
        },
        siliconflow: {
            key: "SiliconFlow API Key",
            model: "文本模型",
            imageModel: "图像模型",
            desc: "DeepSeek 与 Qwen 模型"
        },
        custom: {
            textApiUrl: "文本 API URL",
            textApiKey: "文本 API Key (可选)",
            textModel: "文本模型名称",
            imageApiUrl: "图像 API URL (可选)",
            imageModel: "图像模型名称 (可选)",
            desc: "兼容 OpenAI 格式 (Ollama, vLLM 等)"
        },
        dev: {
            title: "开发者模式",
            enable: "启用开发者模式",
            warning: "高级功能：修改提示词可能会破坏游戏逻辑，请谨慎使用。",
            promptType: "提示词类型",
            editor: "提示词编辑器",
            save: "保存版本",
            history: "历史版本 / 回滚",
            reset: "加载默认值",
            types: {
                initial: "初始场景 (Initial Scene)",
                next: "后续场景 (Next Scene)",
                secret: "秘密回忆 (Secret Memory)",
                image: "图像生成 (Image Gen)"
            },
            savedToast: "版本已保存！",
            restoredToast: "版本已恢复！"
        },
        save: "保存配置",
        cancel: "取消",
        saved: "设置已保存！"
    },
    theme: {
      title: "选择故事主题",
      desc: "选择你的冒险舞台：",
      custom: "自定义剧本",
      customPlaceholder: "例如：赛博朋克侦探，丧尸围城...",
      cancel: "取消",
      start: "下一步",
      names: {
        "Japanese High School": "日式高中校园",
        "School & Magic Academy": "魔法学院",
        "Cat Girl & Maid Cafe": "猫娘女仆咖啡厅",
        "Isekai Fantasy Adventure": "异世界幻想冒险",
        "Cyberpunk Dystopia": "赛博朋克反乌托邦",
        "Post-Apocalyptic Survival": "末日生存",
        "Sci-Fi Space Opera": "科幻太空歌剧",
        "Historical Dynasty": "历史王朝风云",
        "Mythological Fantasy": "神话奇幻",
        "Supernatural Horror": "超自然恐怖",
      }
    },
    game: {
      turn: "回合",
      skip: "快进",
      skipping: "快进中",
      log: "记录",
      auto: "自动",
      hideUi: "隐藏UI",
      specialEvent: "特殊事件",
      menu: "菜单",
      generatingImage: "正在生成新背景...",
      download: "下载图片"
    },
    menu: {
      title: "系统菜单",
      tabs: {
        heroines: "女主角",
        items: "物品",
        system: "系统"
      },
      actions: {
        save: "保存游戏",
        saveDesc: "手动记录当前进度。",
        load: "读取游戏",
        loadDesc: "返回之前的时间线。",
        gallery: "回忆画廊",
        galleryDesc: "查看解锁的CG和事件。",
        unlock: "解锁特殊回忆",
        unlocking: "正在读取回忆...",
      },
      settings: {
        audio: "音频设置",
        volume: "主音量",
        mute: "静音",
        playerName: "玩家昵称",
        changeName: "修改昵称"
      },
      emptyBag: "背包是空的。"
    },
    gallery: {
      title: "事件CG画廊",
      loading: "正在加载回忆...",
      empty: "尚未解锁回忆。",
      emptyDesc: "游玩故事以解锁特殊事件。",
      close: "关闭"
    },
    saveload: {
      saveTitle: "保存游戏",
      loadTitle: "读取游戏",
      autoSave: "自动存档",
      empty: "空存档",
      noData: "无数据",
      deleteConfirm: "确定要删除这个存档吗？",
      saveHere: "保存于此",
      loadGame: "读取进度"
    }
  },
  ja: {
    start: {
      title: "絆",
      subtitle: "無限ビジュアルノベル",
      newGame: "初めから",
      load: "続きから",
      gallery: "ギャラリー",
      config: "設定",
      poweredBy: "Powered by",
      enterName: "名前を入力してください",
      namePlaceholder: "主人公",
      startJourney: "物語を始める",
      loading: "運命を紡いでいます...",
      preparing: "ヒロインを召喚中...",
    },
    config: {
        title: "エンジン設定",
        provider: "AI プロバイダー",
        gemini: {
            key: "Gemini API Key",
            desc: "Google AI Studioから無料キーを取得"
        },
        siliconflow: {
            key: "SiliconFlow API Key",
            model: "テキストモデル",
            imageModel: "画像モデル",
            desc: "DeepSeek & Qwen モデル"
        },
        custom: {
            textApiUrl: "テキスト API URL",
            textApiKey: "テキスト API Key (任意)",
            textModel: "テキストモデル名",
            imageApiUrl: "画像 API URL (任意)",
            imageModel: "画像モデル名 (任意)",
            desc: "OpenAI形式互換 (Ollama, vLLMなど)"
        },
        dev: {
            title: "開発者モード",
            enable: "開発者モードを有効にする",
            warning: "高度な設定：プロンプトを変更するとゲームロジックが破損する可能性があります。",
            promptType: "プロンプトタイプ",
            editor: "プロンプトエディタ",
            save: "バージョンを保存",
            history: "履歴 / 復元",
            reset: "デフォルトに戻す",
            types: {
                initial: "初期シーン (Initial Scene)",
                next: "次シーン (Next Scene)",
                secret: "秘密の記憶 (Secret Memory)",
                image: "画像生成 (Image Gen)"
            },
            savedToast: "保存しました！",
            restoredToast: "復元しました！"
        },
        save: "設定を保存",
        cancel: "キャンセル",
        saved: "設定を保存しました！"
    },
    theme: {
      title: "テーマ選択",
      desc: "物語の舞台を選択してください：",
      custom: "カスタムシナリオ",
      customPlaceholder: "例：サイバーパンク、ゾンビサバイバル...",
      cancel: "キャンセル",
      start: "次へ",
      names: {
        "Japanese High School": "日本の高校生活",
        "School & Magic Academy": "魔法学園",
        "Cat Girl & Maid Cafe": "猫耳メイドカフェ",
        "Isekai Fantasy Adventure": "異世界ファンタジー",
        "Cyberpunk Dystopia": "サイバーパンク",
        "Post-Apocalyptic Survival": "ポストアポカリプス",
        "Sci-Fi Space Opera": "SFスペースオペラ",
        "Historical Dynasty": "歴史・時代劇",
        "Mythological Fantasy": "神話ファンタジー",
        "Supernatural Horror": "超常ホラー",
      }
    },
    game: {
      turn: "ターン",
      skip: "スキップ",
      skipping: "スキップ中",
      log: "ログ",
      auto: "オート",
      hideUi: "UI非表示",
      specialEvent: "スペシャルイベント",
      menu: "メニュー",
      generatingImage: "背景を生成中...",
      download: "ダウンロード"
    },
    menu: {
      title: "システムメニュー",
      tabs: {
        heroines: "ヒロイン",
        items: "アイテム",
        system: "システム"
      },
      actions: {
        save: "セーブ",
        saveDesc: "進行状況を記録します。",
        load: "ロード",
        loadDesc: "以前のタイムラインに戻ります。",
        gallery: "回想モード",
        galleryDesc: "解放されたCGやイベントを見ます。",
        unlock: "特別な思い出を解放",
        unlocking: "読み込み中...",
      },
      settings: {
        audio: "オーディオ設定",
        volume: "主音量",
        mute: "ミュート",
        playerName: "プレイヤー名",
        changeName: "名前変更"
      },
      emptyBag: "空っぽです。"
    },
    gallery: {
      title: "イベントCG",
      loading: "読み込み中...",
      empty: "まだ思い出がありません。",
      emptyDesc: "ストーリーを進めてイベントを解放しましょう。",
      close: "閉じる"
    },
    saveload: {
      saveTitle: "セーブ",
      loadTitle: "ロード",
      autoSave: "オートセーブ",
      empty: "空きスロット",
      noData: "データなし",
      deleteConfirm: "このデータを削除しますか？",
      saveHere: "ここにセーブ",
      loadGame: "ロード"
    }
  },
  ru: {
    start: {
      title: "KIZUNA",
      subtitle: "Бесконечная визуальная новелла",
      newGame: "Новая игра",
      load: "Загрузить",
      gallery: "Галерея",
      config: "Конфиг",
      poweredBy: "При поддержке",
      enterName: "Введите ваше имя",
      namePlaceholder: "Герой",
      startJourney: "Начать путь",
      loading: "Плетение судьбы...",
      preparing: "Призыв героинь...",
    },
    config: {
        title: "Настройки движка",
        provider: "AI Провайдер",
        gemini: {
            key: "Gemini API Key",
            desc: "Бесплатный ключ в AI Studio"
        },
        siliconflow: {
            key: "SiliconFlow API Key",
            model: "Текстовая модель",
            imageModel: "Модель изображений",
            desc: "Модели DeepSeek & Qwen"
        },
        custom: {
            textApiUrl: "URL Текст API",
            textApiKey: "Ключ Текст API (Опц.)",
            textModel: "Имя Текст Модели",
            imageApiUrl: "URL Изображения API (Опц.)",
            imageModel: "Имя Изображения Модели (Опц.)",
            desc: "Совместимо с OpenAI (Ollama, vLLM)"
        },
        dev: {
            title: "Режим Разработчика",
            enable: "Включить режим разработчика",
            warning: "Внимание: Изменение промптов может сломать логику игры.",
            promptType: "Тип промпта",
            editor: "Редактор промптов",
            save: "Сохранить версию",
            history: "История / Откат",
            reset: "Загрузить стандарт",
            types: {
                initial: "Начальная сцена",
                next: "Следующая сцена",
                secret: "Секретное воспоминание",
                image: "Генерация изображений"
            },
            savedToast: "Версия сохранена!",
            restoredToast: "Версия восстановлена!"
        },
        save: "Сохранить",
        cancel: "Отмена",
        saved: "Сохранено!"
    },
    theme: {
      title: "Выбор темы",
      desc: "Выберите сеттинг для вашего приключения:",
      custom: "Свой сценарий",
      customPlaceholder: "Напр.: Киберпанк-детектив, Выживание...",
      cancel: "Отмена",
      start: "Далее",
      names: {
        "Japanese High School": "Японская школа",
        "School & Magic Academy": "Академия магии",
        "Cat Girl & Maid Cafe": "Мейд-кафе с кошкодевочками",
        "Isekai Fantasy Adventure": "Исекай Фэнтези",
        "Cyberpunk Dystopia": "Киберпанк-антиутопия",
        "Post-Apocalyptic Survival": "Постапокалипсис",
        "Sci-Fi Space Opera": "Космическая опера",
        "Historical Dynasty": "Историческая династия",
        "Mythological Fantasy": "Мифологическое фэнтези",
        "Supernatural Horror": "Сверхъестественный хоррор",
      }
    },
    game: {
      turn: "Ход",
      skip: "Пропуск",
      skipping: "Пропуск...",
      log: "Лог",
      auto: "Авто",
      hideUi: "Скрыть UI",
      specialEvent: "ОСОБОЕ СОБЫТИЕ",
      menu: "Меню",
      generatingImage: "Генерация фона...",
      download: "Скачать"
    },
    menu: {
      title: "СИСТЕМНОЕ МЕНЮ",
      tabs: {
        heroines: "Героини",
        items: "Предметы",
        system: "Система"
      },
      actions: {
        save: "Сохранить",
        saveDesc: "Сохранить прогресс вручную.",
        load: "Загрузить",
        loadDesc: "Вернуться к прошлому моменту.",
        gallery: "Галерея",
        galleryDesc: "Просмотр открытых CG и событий.",
        unlock: "Открыть воспоминание",
        unlocking: "Чтение памяти...",
      },
      settings: {
        audio: "Настройки звука",
        volume: "Громкость",
        mute: "Без звука",
        playerName: "Имя игрока",
        changeName: "Изменить"
      },
      emptyBag: "В сумке пусто."
    },
    gallery: {
      title: "Галерея CG",
      loading: "Загрузка...",
      empty: "Нет открытых воспоминаний.",
      emptyDesc: "Играйте, чтобы открыть особые события.",
      close: "Закрыть"
    },
    saveload: {
      saveTitle: "Сохранить игру",
      loadTitle: "Загрузить игру",
      autoSave: "Автосохранение",
      empty: "Пустой слот",
      noData: "Нет данных",
      deleteConfirm: "Вы уверены, что хотите удалить это сохранение?",
      saveHere: "Сохранить здесь",
      loadGame: "Загрузить"
    }
  },
  fr: {
    start: {
      title: "KIZUNA",
      subtitle: "Visual Novel Infini",
      newGame: "Nouvelle Partie",
      load: "Charger",
      gallery: "Galerie",
      config: "Config",
      poweredBy: "Propulsé par",
      enterName: "Entrez votre nom",
      namePlaceholder: "Protagoniste",
      startJourney: "Commencer l'aventure",
      loading: "Tissage de votre destin...",
      preparing: "Invocation des héroïnes...",
    },
    config: {
        title: "Configuration du Moteur",
        provider: "Fournisseur IA",
        gemini: {
            key: "Clé API Gemini",
            desc: "Obtenir gratuitement via Google AI Studio"
        },
        siliconflow: {
            key: "Clé API SiliconFlow",
            model: "Modèle Texte",
            imageModel: "Modèle Image",
            desc: "Modèles DeepSeek & Qwen"
        },
        custom: {
            textApiUrl: "URL API Texte",
            textApiKey: "Clé API Texte (Opt.)",
            textModel: "Modèle Texte",
            imageApiUrl: "URL API Image (Opt.)",
            imageModel: "Modèle Image (Opt.)",
            desc: "Compatible format OpenAI (Ollama, vLLM...)"
        },
        dev: {
            title: "Mode Développeur",
            enable: "Activer le mode développeur",
            warning: "Avancé : Modifier les prompts peut casser la logique du jeu.",
            promptType: "Type de Prompt",
            editor: "Éditeur de Prompt",
            save: "Sauvegarder Version",
            history: "Historique / Restaurer",
            reset: "Charger Défaut",
            types: {
                initial: "Scène Initiale",
                next: "Scène Suivante",
                secret: "Souvenir Secret",
                image: "Génération d'Image"
            },
            savedToast: "Version sauvegardée !",
            restoredToast: "Version restaurée !"
        },
        save: "Sauvegarder",
        cancel: "Annuler",
        saved: "Paramètres sauvegardés!"
    },
    theme: {
      title: "Choisir un Thème",
      desc: "Choisissez le cadre de votre aventure :",
      custom: "Scénario Personnalisé",
      customPlaceholder: "Ex: Détective Cyberpunk, Survie Zombie...",
      cancel: "Annuler",
      start: "Suivant",
      names: {
        "Japanese High School": "Lycée Japonais",
        "School & Magic Academy": "Académie de Magie",
        "Cat Girl & Maid Cafe": "Neko Maid Café",
        "Isekai Fantasy Adventure": "Aventure Isekai Fantasy",
        "Cyberpunk Dystopia": "Dystopie Cyberpunk",
        "Post-Apocalyptic Survival": "Survie Post-Apocalyptique",
        "Sci-Fi Space Opera": "Space Opera Sci-Fi",
        "Historical Dynasty": "Dynastie Historique",
        "Mythological Fantasy": "Fantasy Mythologique",
        "Supernatural Horror": "Horreur Surnaturelle",
      }
    },
    game: {
      turn: "Tour",
      skip: "Passer",
      skipping: "Avance rapide",
      log: "Journal",
      auto: "Auto",
      hideUi: "Masquer UI",
      specialEvent: "ÉVÉNEMENT SPÉCIAL",
      menu: "Menu",
      generatingImage: "Génération du fond...",
      download: "Télécharger"
    },
    menu: {
      title: "MENU SYSTÈME",
      tabs: {
        heroines: "Héroïnes",
        items: "Objets",
        system: "Système"
      },
      actions: {
        save: "Sauvegarder",
        saveDesc: "Enregistrer votre progression.",
        load: "Charger",
        loadDesc: "Retourner à un moment précédent.",
        gallery: "Galerie Souvenirs",
        galleryDesc: "Voir les CG et événements débloqués.",
        unlock: "Débloquer Souvenir",
        unlocking: "Lecture du souvenir...",
      },
      settings: {
        audio: "Paramètres Audio",
        volume: "Volume Principal",
        mute: "Muet",
        playerName: "Nom du Joueur",
        changeName: "Changer"
      },
      emptyBag: "Votre sac est vide."
    },
    gallery: {
      title: "Galerie CG",
      loading: "Chargement...",
      empty: "Aucun souvenir débloqué.",
      emptyDesc: "Jouez pour débloquer des événements spéciaux.",
      close: "Fermer"
    },
    saveload: {
      saveTitle: "Sauvegarder",
      loadTitle: "Charger",
      autoSave: "Sauvegarde Auto",
      empty: "Emplacement Vide",
      noData: "Aucune Donnée",
      deleteConfirm: "Voulez-vous vraiment supprimer cette sauvegarde ?",
      saveHere: "Sauvegarder ici",
      loadGame: "Charger"
    }
  }
};

export type Language = keyof typeof translations;
export type TranslationType = typeof translations.en;