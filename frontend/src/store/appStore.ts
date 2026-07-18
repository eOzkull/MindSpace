
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type RiskFilter = 'All' | 'Low' | 'Medium' | 'High';
export type DatasetTarget = 'primary' | 'compare';
export type Theme = 'dark' | 'light';

export interface UIState {
  theme: Theme;
  isDarkMode: boolean;
  riskFilter: RiskFilter;
  searchQuery: string;
  isSidebarOpen: boolean;
  isGlobalLoading: boolean;
  loadingMessage: string;
}

export interface UIActions {
  setTheme: (theme: Theme) => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  setRiskFilter: (filter: RiskFilter) => void;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  resetUIFilters: () => void;
}


export interface SelectionState {

  selectedDataset: DatasetTarget;
  selectedStudentRows: number[];
  isComparisonActive: boolean;
  sessionId: string | null;
  selectedPredictionDataset: DatasetTarget;
}

export interface SelectionActions {
  setSelectedDataset: (dataset: DatasetTarget) => void;
  selectStudentRow: (rowIndex: number) => void;
  deselectStudentRow: (rowIndex: number) => void;
  toggleStudentRow: (rowIndex: number) => void;
  selectAllStudentRows: (indices: number[]) => void;
  clearStudentSelection: () => void;
  setComparisonActive: (active: boolean) => void;
  setSessionId: (id: string | null) => void;
  setSelectedPredictionDataset: (dataset: DatasetTarget) => void;
  resetSelection: () => void;
}

export type AppStore = UIState & UIActions & SelectionState & SelectionActions;


const DEFAULT_UI: UIState = {
  theme: 'dark',
  isDarkMode: true,
  riskFilter: 'All',
  searchQuery: '',
  isSidebarOpen: false,
  isGlobalLoading: false,
  loadingMessage: '',
};

const DEFAULT_SELECTION: SelectionState = {
  selectedDataset: 'primary',
  selectedStudentRows: [],
  isComparisonActive: false,
  sessionId: null,
  selectedPredictionDataset: 'primary',
};


export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      ...DEFAULT_UI,

      setTheme: (theme) =>
        set({ theme, isDarkMode: theme === 'dark' }, false, 'ui/setTheme'),

      setDarkMode: (enabled) =>
        set(
          { isDarkMode: enabled, theme: enabled ? 'dark' : 'light' },
          false,
          'ui/setDarkMode',
        ),

      toggleDarkMode: () => {
        const next = !get().isDarkMode;
        set(
          { isDarkMode: next, theme: next ? 'dark' : 'light' },
          false,
          'ui/toggleDarkMode',
        );
      },

      setRiskFilter: (filter) =>
        set({ riskFilter: filter }, false, 'ui/setRiskFilter'),

      setSearchQuery: (query) =>
        set({ searchQuery: query }, false, 'ui/setSearchQuery'),

      setSidebarOpen: (open) =>
        set({ isSidebarOpen: open }, false, 'ui/setSidebarOpen'),

      toggleSidebar: () =>
        set(
          (s) => ({ isSidebarOpen: !s.isSidebarOpen }),
          false,
          'ui/toggleSidebar',
        ),

      setGlobalLoading: (loading, message = '') =>
        set(
          { isGlobalLoading: loading, loadingMessage: message },
          false,
          'ui/setGlobalLoading',
        ),

      resetUIFilters: () =>
        set(
          {
            riskFilter: DEFAULT_UI.riskFilter,
            searchQuery: DEFAULT_UI.searchQuery,
          },
          false,
          'ui/resetUIFilters',
        ),

      ...DEFAULT_SELECTION,

      setSelectedDataset: (dataset) =>
        set(
          { selectedDataset: dataset },
          false,
          'selection/setSelectedDataset',
        ),

      selectStudentRow: (rowIndex) =>
        set(
          (s) => ({
            selectedStudentRows: s.selectedStudentRows.includes(rowIndex)
              ? s.selectedStudentRows
              : [...s.selectedStudentRows, rowIndex],
          }),
          false,
          'selection/selectStudentRow',
        ),

      deselectStudentRow: (rowIndex) =>
        set(
          (s) => ({
            selectedStudentRows: s.selectedStudentRows.filter(
              (i) => i !== rowIndex,
            ),
          }),
          false,
          'selection/deselectStudentRow',
        ),

      toggleStudentRow: (rowIndex) => {
        const rows = get().selectedStudentRows;
        set(
          {
            selectedStudentRows: rows.includes(rowIndex)
              ? rows.filter((i) => i !== rowIndex)
              : [...rows, rowIndex],
          },
          false,
          'selection/toggleStudentRow',
        );
      },

      selectAllStudentRows: (indices) =>
        set(
          { selectedStudentRows: [...new Set(indices)] },
          false,
          'selection/selectAllStudentRows',
        ),

      clearStudentSelection: () =>
        set(
          { selectedStudentRows: [] },
          false,
          'selection/clearStudentSelection',
        ),

      setComparisonActive: (active) =>
        set(
          { isComparisonActive: active },
          false,
          'selection/setComparisonActive',
        ),

      setSessionId: (id) =>
        set({ sessionId: id }, false, 'selection/setSessionId'),

      setSelectedPredictionDataset: (dataset) =>
        set(
          { selectedPredictionDataset: dataset },
          false,
          'selection/setSelectedPredictionDataset',
        ),

      resetSelection: () =>
        set({ ...DEFAULT_SELECTION }, false, 'selection/resetSelection'),
    }),
    { name: 'MindSpaceStore' },
  ),
);


// UI selectors
export const selectTheme = (s: AppStore): Theme => s.theme;
export const selectIsDarkMode = (s: AppStore): boolean => s.isDarkMode;
export const selectRiskFilter = (s: AppStore): RiskFilter => s.riskFilter;
export const selectSearchQuery = (s: AppStore): string => s.searchQuery;
export const selectIsSidebarOpen = (s: AppStore): boolean => s.isSidebarOpen;
export const selectIsGlobalLoading = (s: AppStore): boolean =>
  s.isGlobalLoading;
export const selectLoadingMessage = (s: AppStore): string => s.loadingMessage;

// Selection selectors
export const selectSelectedDataset = (s: AppStore): DatasetTarget =>
  s.selectedDataset;
export const selectSelectedStudentRows = (s: AppStore): number[] =>
  s.selectedStudentRows;
export const selectIsComparisonActive = (s: AppStore): boolean =>
  s.isComparisonActive;
export const selectSessionId = (s: AppStore): string | null => s.sessionId;
export const selectSelectedPredictionDataset = (s: AppStore): DatasetTarget =>
  s.selectedPredictionDataset;

// Derived selectors
export const selectHasStudentSelection = (s: AppStore): boolean =>
  s.selectedStudentRows.length > 0;
export const selectStudentSelectionCount = (s: AppStore): number =>
  s.selectedStudentRows.length;


export const appActions = {
  // UI
  setTheme: (theme: Theme) => useAppStore.getState().setTheme(theme),
  setDarkMode: (enabled: boolean) =>
    useAppStore.getState().setDarkMode(enabled),
  toggleDarkMode: () => useAppStore.getState().toggleDarkMode(),
  setRiskFilter: (filter: RiskFilter) =>
    useAppStore.getState().setRiskFilter(filter),
  setSearchQuery: (query: string) =>
    useAppStore.getState().setSearchQuery(query),
  setSidebarOpen: (open: boolean) =>
    useAppStore.getState().setSidebarOpen(open),
  toggleSidebar: () => useAppStore.getState().toggleSidebar(),
  setGlobalLoading: (loading: boolean, message?: string) =>
    useAppStore.getState().setGlobalLoading(loading, message),
  resetUIFilters: () => useAppStore.getState().resetUIFilters(),

  // Selection
  setSelectedDataset: (dataset: DatasetTarget) =>
    useAppStore.getState().setSelectedDataset(dataset),
  selectStudentRow: (rowIndex: number) =>
    useAppStore.getState().selectStudentRow(rowIndex),
  deselectStudentRow: (rowIndex: number) =>
    useAppStore.getState().deselectStudentRow(rowIndex),
  toggleStudentRow: (rowIndex: number) =>
    useAppStore.getState().toggleStudentRow(rowIndex),
  selectAllStudentRows: (indices: number[]) =>
    useAppStore.getState().selectAllStudentRows(indices),
  clearStudentSelection: () => useAppStore.getState().clearStudentSelection(),
  setComparisonActive: (active: boolean) =>
    useAppStore.getState().setComparisonActive(active),
  setSessionId: (id: string | null) => useAppStore.getState().setSessionId(id),
  setSelectedPredictionDataset: (dataset: DatasetTarget) =>
    useAppStore.getState().setSelectedPredictionDataset(dataset),
  resetSelection: () => useAppStore.getState().resetSelection(),
};
