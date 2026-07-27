import React from 'react';
import {
  Home,
  LayoutDashboard,
  FileSpreadsheet,
  Brain,
  Layers,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Table
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { path: '/', label: 'Home', icon: Home },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/results', label: 'Results', icon: FileSpreadsheet },
      { path: '/evaluate', label: 'Model Evaluation', icon: Brain },
    ]
  },
  {
    title: 'Tools',
    items: [
      { path: '/compare', label: 'Dataset Comparison', icon: Layers },
      { path: '/predict', label: 'Predictor', icon: Sparkles },
      { path: '/edit', label: 'Edit Data', icon: Table },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { path: '/anomalies', label: 'Anomalies', icon: AlertTriangle },
      { path: '/recommendations', label: 'Guidelines', icon: Lightbulb },
    ]
  }
];

export interface PageMeta {
  title: string;
  subtitle: string;
  section?: string;
}

export const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'Intelligence Hub',
    subtitle: 'Upload cohort data, process feature telemetry, and analyze burnout metrics.'
  },
  '/dashboard': {
    title: 'Analytics Dashboard',
    subtitle: 'High-density exploratory view of student burnout indicators.',
    section: 'Analytics'
  },
  '/results': {
    title: 'Analysis & Conclusions',
    subtitle: 'Key conclusions, statistical summaries, and cohort behavior.',
    section: 'Analytics'
  },
  '/evaluate': {
    title: 'Model Performance Evaluation',
    subtitle: 'Validation metrics, cross-validation scoring, and feature attribution.',
    section: 'Analytics'
  },
  '/compare': {
    title: 'Comparative Data Matrix',
    subtitle: 'Side-by-side comparative analysis of datasets and student cohorts.',
    section: 'Tools'
  },
  '/predict': {
    title: 'Individual Burnout Calculator',
    subtitle: 'Input student parameters to infer burnout risk probability using ML.',
    section: 'Tools'
  },
  '/edit': {
    title: 'Interactive Dataset Editor',
    subtitle: 'Modify underlying dataset values and trigger instant model re-evaluation.',
    section: 'Tools'
  },
  '/anomalies': {
    title: 'Outlier & Anomaly Detection',
    subtitle: 'Unsupervised detection of anomalous student behavior vectors.',
    section: 'Intelligence'
  },
  '/recommendations': {
    title: 'Institutional Policy Guidelines',
    subtitle: 'Prescriptive intervention strategies generated from machine learning cohorts.',
    section: 'Intelligence'
  }
};

export const getPageMeta = (pathname: string): PageMeta => {
  return PAGE_META[pathname] || {
    title: 'MindSpace',
    subtitle: 'AI-Powered Student Burnout Intelligence Platform'
  };
};
