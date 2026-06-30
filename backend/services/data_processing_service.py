import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def process_data(data_df, plot_dir, sia):
    if data_df is None:
        return None, None

    os.makedirs(plot_dir, exist_ok=True)

    # Fuzzy column mapping
    col_map = {
        'sleep_hours': ['sleep_hours', 'sleep hours', 'sleep', 'sleeping_hours'],
        'study_hours': ['study_hours', 'study hours', 'study', 'studying_hours'],
        'stress_level': ['stress_level', 'stress level', 'stress', 'stress_score']
    }
    
    actual_map = {}
    for target, variations in col_map.items():
        found = False
        for col in data_df.columns:
            if col.lower().strip() in variations:
                actual_map[target] = col
                found = True
                break
        if not found:
            actual_map[target] = target # Default to target name

    numeric_cols = ['sleep_hours', 'study_hours', 'stress_level']
    for target, actual in actual_map.items():
        if actual in data_df.columns:
            data_df[target] = pd.to_numeric(data_df[actual], errors='coerce').fillna(0)
            data_df[target] = data_df[target].apply(lambda x: max(x, 0))

    from services.burnout_service import calculate_burnout, assign_risk, calculate_sentiment
    data_df = calculate_burnout(data_df)
    data_df = assign_risk(data_df)
    data_df = calculate_sentiment(data_df, sia)

    available_cols = [c for c in ['sleep_hours', 'study_hours', 'stress_level', 'burnout_score'] if c in data_df.columns]
    corr_matrix = data_df[available_cols].corr()

    dark_bg = '#0f1117'
    text_col = '#c9d1d9'
    grid_col = '#30363d'
    accent = '#4facfe'

    def _dark_fig(w=7, h=4):
        fig, ax = plt.subplots(figsize=(w, h), dpi=150)
        fig.patch.set_facecolor(dark_bg)
        ax.set_facecolor(dark_bg)
        ax.tick_params(colors=text_col)
        for spine in ax.spines.values():
            spine.set_edgecolor(grid_col)
        ax.yaxis.label.set_color(text_col)
        ax.xaxis.label.set_color(text_col)
        ax.title.set_color(text_col)
        ax.grid(True, color=grid_col, linestyle='--', linewidth=0.5)
        return fig, ax

    # 1. Burnout score histogram
    fig, ax = _dark_fig()
    ax.hist(data_df['burnout_score'], bins=20, color=accent, edgecolor='#0b0e14', alpha=0.9)
    ax.set_title('Burnout Score Distribution')
    ax.set_xlabel('Burnout Score')
    ax.set_ylabel('Number of Students')
    plt.tight_layout()
    plt.savefig(os.path.join(plot_dir, 'score_hist.png'))
    plt.close('all')

    # 2. Risk pie chart
    if 'risk' in data_df.columns:
        counts = data_df['risk'].value_counts()
        fig, ax = _dark_fig(6, 5)
        colors = ['#28c76f', '#4facfe', '#ff4b5c']
        wedges, texts, autotexts = ax.pie(
            counts, labels=counts.index, autopct='%1.1f%%',
            colors=colors, startangle=140,
            textprops={'color': text_col}
        )
        for at in autotexts:
            at.set_color(dark_bg)
            at.set_fontweight('bold')
        ax.set_title('Burnout Risk Proportions')
        fig.patch.set_facecolor(dark_bg)
        plt.tight_layout()
        plt.savefig(os.path.join(plot_dir, 'risk_pie.png'))
        plt.close('all')

    # 3. Stress vs Burnout bar
    if 'stress_level' in data_df.columns:
        grouped = data_df.groupby('stress_level')['burnout_score'].mean()
        fig, ax = _dark_fig()
        ax.bar(grouped.index, grouped.values, color=accent, alpha=0.85, edgecolor=dark_bg)
        ax.set_title('Avg Burnout by Stress Level')
        ax.set_xlabel('Stress Level (1-10)')
        ax.set_ylabel('Avg Burnout Score')
        plt.tight_layout()
        plt.savefig(os.path.join(plot_dir, 'stress_vs_burnout.png'))
        plt.close('all')

    # 4. Correlation heatmap
    if len(available_cols) > 1:
        fig, ax = _dark_fig(7, 5)
        sns.heatmap(
            corr_matrix, annot=True, fmt='.2f', cmap='coolwarm',
            ax=ax, linewidths=0.5, linecolor=dark_bg,
            annot_kws={'color': text_col}
        )
        ax.set_title('Feature Correlation Heatmap')
        fig.patch.set_facecolor(dark_bg)
        plt.tight_layout()
        plt.savefig(os.path.join(plot_dir, 'correlation_heatmap.png'))
        plt.close('all')

    # 5. Sleep vs Burnout scatter
    if 'sleep_hours' in data_df.columns:
        fig, ax = _dark_fig()
        sns.scatterplot(
            data=data_df, x='sleep_hours', y='burnout_score',
            hue='risk' if 'risk' in data_df.columns else None,
            palette={'Low': '#28c76f', 'Medium': '#4facfe', 'High': '#ff4b5c'} if 'risk' in data_df.columns else None,
            ax=ax, s=60, alpha=0.8, edgecolor=dark_bg
        )
        ax.set_title('Sleep Hours vs Burnout Score')
        ax.set_xlabel('Sleep Hours')
        ax.set_ylabel('Burnout Score')
        ax.legend(facecolor=dark_bg, labelcolor=text_col, edgecolor=grid_col)
        plt.tight_layout()
        plt.savefig(os.path.join(plot_dir, 'sleep_vs_burnout.png'))
        plt.close('all')

    # 6. Burnout by risk tier boxplot
    if 'risk' in data_df.columns:
        fig, ax = _dark_fig(6, 4)
        sns.boxplot(
            data=data_df, x='risk', y='burnout_score',
            palette={'Low': '#28c76f', 'Medium': '#4facfe', 'High': '#ff4b5c'},
            ax=ax,
            boxprops={'alpha': 0.7, 'edgecolor': 'none'},
            medianprops={'color': '#fff', 'linewidth': 2},
            whiskerprops={'color': text_col},
            capprops={'color': text_col},
            flierprops={'marker': 'o', 'markerfacecolor': text_col, 'markeredgecolor': 'none', 'alpha': 0.5}
        )
        ax.set_title('Burnout Score Spread by Risk Tier')
        ax.set_xlabel('Burnout Risk')
        ax.set_ylabel('Burnout Score')
        plt.tight_layout()
        plt.savefig(os.path.join(plot_dir, 'burnout_boxplot.png'))
        plt.close('all')

    # 7. Study Hours vs Burnout
    if 'study_hours' in data_df.columns:
        fig, ax = _dark_fig()
        sns.scatterplot(
            data=data_df, x='study_hours', y='burnout_score',
            color='#b392ac', ax=ax, s=50, alpha=0.7, edgecolor='none'
        )
        ax.set_title('Study Hours vs Burnout Score')
        ax.set_xlabel('Study Hours')
        ax.set_ylabel('Burnout Score')
        plt.tight_layout()
        plt.savefig(os.path.join(plot_dir, 'study_vs_burnout.png'))
        plt.close('all')

    # 8. Stress vs Sleep Hours
    if 'stress_level' in data_df.columns and 'sleep_hours' in data_df.columns:
        fig, ax = _dark_fig()
        sns.regplot(
            data=data_df, x='stress_level', y='sleep_hours',
            scatter_kws={'color': '#4facfe', 'alpha': 0.6, 's': 40, 'edgecolor': 'none'},
            line_kws={'color': '#ff4b5c', 'linewidth': 2},
            ax=ax
        )
        ax.set_title('Stress Level vs Sleep Hours')
        ax.set_xlabel('Stress Level')
        ax.set_ylabel('Sleep Hours')
        plt.tight_layout()
        plt.savefig(os.path.join(plot_dir, 'stress_vs_sleep.png'))
        plt.close('all')

    # 9. Sentiment distribution
    if 'sentiment_score' in data_df.columns:
        fig, ax = _dark_fig()
        ax.hist(data_df['sentiment_score'], bins=15, color='#a8e6cf', edgecolor='none', alpha=0.8)
        ax.axvline(0, color=text_col, linestyle='--', linewidth=0.8)
        ax.set_title('Sentiment Score Distribution')
        ax.set_xlabel('VADER Compound Score (-1 to 1)')
        ax.set_ylabel('Students')
        plt.tight_layout()
        plt.savefig(os.path.join(plot_dir, 'sentiment_dist.png'))
        plt.close('all')

    # 10. Sentiment vs Burnout
    if 'sentiment_score' in data_df.columns:
        fig, ax = _dark_fig()
        sns.scatterplot(
            data=data_df, x='sentiment_score', y='burnout_score',
            hue='risk' if 'risk' in data_df.columns else None,
            palette={'Low': '#28c76f', 'Medium': '#4facfe', 'High': '#ff4b5c'} if 'risk' in data_df.columns else None,
            ax=ax, s=50, alpha=0.8, edgecolor='none'
        )
        ax.axvline(0, color=text_col, linestyle='--', linewidth=0.8, alpha=0.5)
        ax.set_title('Sentiment vs Burnout Score')
        ax.set_xlabel('Sentiment Score')
        ax.set_ylabel('Burnout Score')
        ax.legend(facecolor=dark_bg, labelcolor=text_col, edgecolor=grid_col)
        plt.tight_layout()
        plt.savefig(os.path.join(plot_dir, 'sentiment_vs_burnout.png'))
        plt.close('all')
        
    return data_df, corr_matrix
