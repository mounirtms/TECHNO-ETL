import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import locale files
import enLocale from '../assets/locale/en.json';
import frLocale from '../assets/locale/fr.json';
import arLocale from '../assets/locale/ar.json';

// Enhanced locale resources with grid-specific translations
const resources = {
  en: {
    translation: {
      ...enLocale,
      grid: {
        common: {
          loading: 'Loading...',
          noData: 'No data available',
          error: 'Error loading data',
          refresh: 'Refresh',
          export: 'Export',
          import: 'Import',
          settings: 'Settings',
          filters: 'Filters',
          search: 'Search',
          clear: 'Clear',
          apply: 'Apply',
          cancel: 'Cancel',
          save: 'Save',
          delete: 'Delete',
          edit: 'Edit',
          add: 'Add',
          view: 'View',
          actions: 'Actions',
          selected: 'Selected',
          total: 'Total',
          page: 'Page',
          of: 'of',
          rows: 'rows',
          rowsPerPage: 'Rows per page',
          density: 'Row Density',
          columns: 'Columns',
          moreSettings: 'More Settings',
          resetDefaults: 'Reset to Defaults',
          compact: 'Compact',
          standard: 'Standard',
          comfortable: 'Comfortable',
          sort: 'Sort',
          filter: 'Filter',
          group: 'Group',
          pin: 'Pin',
          hide: 'Hide',
          show: 'Show',
          reset: 'Reset'
        },
        toolbar: {
          refresh: 'Refresh Data',
          add: 'Add New',
          edit: 'Edit Selected',
          delete: 'Delete Selected',
          export: 'Export Data',
          import: 'Import Data',
          settings: 'Grid Settings',
          filters: 'Show Filters',
          search: 'Search...',
          clearFilters: 'Clear All Filters',
          selectAll: 'Select All',
          deselectAll: 'Deselect All',
          selectedCount: '{{count}} selected'
        },
        contextMenu: {
          edit: 'Edit Row',
          delete: 'Delete Row',
          duplicate: 'Duplicate Row',
          view: 'View Details',
          export: 'Export Row',
          copy: 'Copy',
          paste: 'Paste',
          cut: 'Cut'
        },
        settings: {
          title: 'Grid Settings',
          columns: 'Column Settings',
          visibility: 'Column Visibility',
          order: 'Column Order',
          pinning: 'Column Pinning',
          density: 'Row Density',
          compact: 'Compact',
          standard: 'Standard',
          comfortable: 'Comfortable',
          autoSize: 'Auto Size Columns',
          resetLayout: 'Reset Layout',
          saveLayout: 'Save Layout',
          loadLayout: 'Load Layout'
        },
        filters: {
          title: 'Filters',
          addFilter: 'Add Filter',
          removeFilter: 'Remove Filter',
          operator: 'Operator',
          value: 'Value',
          contains: 'Contains',
          equals: 'Equals',
          startsWith: 'Starts with',
          endsWith: 'Ends with',
          isEmpty: 'Is empty',
          isNotEmpty: 'Is not empty',
          isAnyOf: 'Is any of',
          greaterThan: 'Greater than',
          lessThan: 'Less than',
          between: 'Between',
          and: 'And',
          or: 'Or'
        },
        floating: {
          add: 'Add New Item',
          edit: 'Edit Selected',
          delete: 'Delete Selected',
          export: 'Export Selection',
          sync: 'Sync Data',
          refresh: 'Refresh',
          settings: 'Settings'
        }
      }
    }
  },
  fr: {
    translation: {
      ...frLocale,
      grid: {
        common: {
          loading: 'Chargement...',
          noData: 'Aucune donnée disponible',
          error: 'Erreur lors du chargement des données',
          refresh: 'Actualiser',
          export: 'Exporter',
          import: 'Importer',
          settings: 'Paramètres',
          filters: 'Filtres',
          search: 'Rechercher',
          clear: 'Effacer',
          apply: 'Appliquer',
          cancel: 'Annuler',
          save: 'Enregistrer',
          delete: 'Supprimer',
          edit: 'Modifier',
          add: 'Ajouter',
          view: 'Voir',
          actions: 'Actions',
          selected: 'Sélectionné',
          total: 'Total',
          page: 'Page',
          of: 'de',
          rows: 'lignes',
          rowsPerPage: 'Lignes par page',
          density: 'Densité des lignes',
          columns: 'Colonnes',
          moreSettings: 'Plus de paramètres',
          resetDefaults: 'Réinitialiser par défaut',
          compact: 'Compact',
          standard: 'Standard',
          comfortable: 'Confortable',
          sort: 'Trier',
          filter: 'Filtrer',
          group: 'Grouper',
          pin: 'Épingler',
          hide: 'Masquer',
          show: 'Afficher',
          reset: 'Réinitialiser'
        },
        toolbar: {
          refresh: 'Actualiser les données',
          add: 'Ajouter nouveau',
          edit: 'Modifier la sélection',
          delete: 'Supprimer la sélection',
          export: 'Exporter les données',
          import: 'Importer les données',
          settings: 'Paramètres de grille',
          filters: 'Afficher les filtres',
          search: 'Rechercher...',
          clearFilters: 'Effacer tous les filtres',
          selectAll: 'Tout sélectionner',
          deselectAll: 'Tout désélectionner',
          selectedCount: '{{count}} sélectionné(s)'
        }
      }
    }
  },
  ar: {
    translation: {
      ...arLocale,
      grid: {
        common: {
          loading: 'جاري التحميل...',
          noData: 'لا توجد بيانات متاحة',
          error: 'خطأ في تحميل البيانات',
          refresh: 'تحديث',
          export: 'تصدير',
          import: 'استيراد',
          settings: 'الإعدادات',
          filters: 'المرشحات',
          search: 'بحث',
          clear: 'مسح',
          apply: 'تطبيق',
          cancel: 'إلغاء',
          save: 'حفظ',
          delete: 'حذف',
          edit: 'تعديل',
          add: 'إضافة',
          view: 'عرض',
          actions: 'الإجراءات',
          selected: 'محدد',
          total: 'المجموع',
          page: 'صفحة',
          of: 'من',
          rows: 'صفوف',
          rowsPerPage: 'صفوف لكل صفحة',
          density: 'كثافة الصفوف',
          columns: 'الأعمدة',
          moreSettings: 'المزيد من الإعدادات',
          resetDefaults: 'إعادة تعيين الافتراضي',
          compact: 'مضغوط',
          standard: 'قياسي',
          comfortable: 'مريح',
          sort: 'ترتيب',
          filter: 'تصفية',
          group: 'تجميع',
          pin: 'تثبيت',
          hide: 'إخفاء',
          show: 'إظهار',
          reset: 'إعادة تعيين'
        },
        toolbar: {
          refresh: 'تحديث البيانات',
          add: 'إضافة جديد',
          edit: 'تعديل المحدد',
          delete: 'حذف المحدد',
          export: 'تصدير البيانات',
          import: 'استيراد البيانات',
          settings: 'إعدادات الشبكة',
          filters: 'إظهار المرشحات',
          search: 'بحث...',
          clearFilters: 'مسح جميع المرشحات',
          selectAll: 'تحديد الكل',
          deselectAll: 'إلغاء تحديد الكل',
          selectedCount: '{{count}} محدد'
        }
      }
    }
  }
};

// Language detection options
const detectionOptions = {
  order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
  lookupLocalStorage: 'i18nextLng',
  caches: ['localStorage'],
  excludeCacheFor: ['cimode'],
  checkWhitelist: true
};

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: detectionOptions,
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i']
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}'
    }
  });

// Helper functions
export const getCurrentLanguage = () => i18n.language;
export const getDirection = () => i18n.dir();
export const isRTL = () => i18n.dir() === 'rtl';
export const changeLanguage = (lng) => i18n.changeLanguage(lng);

// Language configuration
export const supportedLanguages = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' }
};

export default i18n;
