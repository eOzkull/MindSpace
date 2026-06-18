import os
import json
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, session
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.style.use('ggplot')
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
import seaborn as sns

try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon')

sia = SentimentIntensityAnalyzer()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mindspace_secret_key'
app.jinja_env.filters['enumerate'] = enumerate

data_df = None
corr_matrix = None
eval_metrics = {'primary': None, 'compare': None}
compare_df = None
compare_meta = None

@app.route('/')
def index():
    history = session.get('history', [])
    return render_template('index.html', history=history, active_page='index')

@app.route('/reset')
def reset():
    session.pop('history', None)
    return redirect(url_for('index'))

@app.route('/delete-session/<int:idx>')
def delete_session(idx):
    history = session.get('history', [])
    if 0 <= idx < len(history):
        history.pop(idx)
        session['history'] = history
        session.modified = True
    return redirect(url_for('index'))

@app.route('/upload', methods=['POST', 'GET'])
def upload():
    global data_df
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(url_for('index'))
        file = request.files['file']
        if file.filename == '':
            return redirect(url_for('index'))
        if file and file.filename.endswith('.csv'):
            try:
                data_df = pd.read_csv(file)
                history = session.get('history', [])
                new_entry = {
                    'filename': file.filename,
                    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M"),
                    'records': len(data_df)
                }
                history.insert(0, new_entry)
                session['history'] = history[:10]
                session.modified = True
                process_data()
                os.makedirs('data', exist_ok=True)
                data_df.to_csv('data/updated_sample.csv', index=False)
                flash(f"Successfully uploaded {file.filename}. {len(data_df)} records processed.", "success")
                return redirect(url_for('dashboard'))
            except Exception as e:
                flash(f"Error processing CSV: {str(e)}", "danger")
                return redirect(url_for('index'))
        else:
            flash("Invalid file format. Please upload a CSV file.", "danger")
    return redirect(url_for('index'))


    class_mapping = {'Low': 0, 'Medium': 1, 'High': 2}
    y_encoded = y.map(class_mapping)

    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)

    cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2]).tolist()
    
    from sklearn.metrics import classification_report
    report = classification_report(y_test, y_pred, target_names=['Low', 'Medium', 'High'], output_dict=True, zero_division=0)

    # Save cm plot
    plot_dir = os.path.join(app.static_folder, 'plots')
    os.makedirs(plot_dir, exist_ok=True)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Low', 'Medium', 'High'], yticklabels=['Low', 'Medium', 'High'])
    plt.title('Confusion Matrix')
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    plt.tight_layout()
    plt.savefig(os.path.join(plot_dir, 'confusion_matrix.png'))
    plt.close('all')

    eval_metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': round(precision_score(y_test, y_pred, average='weighted', zero_division=0), 3),
        'recall': round(recall_score(y_test, y_pred, average='weighted', zero_division=0), 3),
        'f1': round(f1_score(y_test, y_pred, average='weighted', zero_division=0), 3),
        'roc_auc': round(roc_auc_score(y_test, y_prob, multi_class='ovr'), 3),
        'confusion_matrix': cm,
        'class_names': ['Low', 'Medium', 'High'],
        'n_test': len(y_test),
        'report': report
    }

def process_data():
    global data_df, corr_matrix, eval_metrics
    if data_df is None:
        return
    plot_dir = os.path.join(app.static_folder, 'plots')
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

    data_df['burnout_score'] = data_df.apply(
        lambda row: ((row.get('study_hours', 0) / row.get('sleep_hours', 1)
                      if row.get('sleep_hours', 0) > 0 else 0) * row.get('stress_level', 0)) * 10,
        axis=1
    )
    data_df['burnout_score'] = np.clip(data_df['burnout_score'], 0, 100)

    data_df['risk'] = pd.cut(
        data_df['burnout_score'], bins=[-1, 33, 66, 101], labels=['Low', 'Medium', 'High']
    )

    if 'feedback' in data_df.columns:
        data_df['sentiment_score'] = data_df['feedback'].apply(
            lambda x: sia.polarity_scores(str(x))['compound']
        )
    else:
        data_df['sentiment_score'] = 0

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
        
    # Auto-train ML model silently in background
    _auto_train('primary')


def _auto_train(target='primary'):
    """Train a RandomForest on the specified dataset and store metrics in eval_metrics[target]."""
    global data_df, compare_df, eval_metrics
    
    df = data_df if target == 'primary' else compare_df
    if df is None:
        eval_metrics[target] = None
        return

    try:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import LabelEncoder
        from sklearn.metrics import (
            accuracy_score, precision_score, recall_score,
            f1_score, roc_auc_score, confusion_matrix, classification_report
        )

        feature_cols = [c for c in ['sleep_hours', 'study_hours', 'stress_level'] if c in df.columns]
        if 'risk' not in df.columns or len(feature_cols) < 2:
            eval_metrics[target] = None
            return

        df_clean = df[feature_cols + ['risk']].dropna()
        if df_clean.empty or df_clean['risk'].nunique() < 2:
            eval_metrics[target] = None
            return

        le = LabelEncoder()
        y = le.fit_transform(df_clean['risk'])
        X = df_clean[feature_cols].values
        class_names = le.classes_.tolist()

        if len(y) < 10:
            eval_metrics[target] = None
            return

        test_size = max(0.15, min(0.3, 20 / len(y)))
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )

        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)

        cm = confusion_matrix(y_test, y_pred).tolist()
        report = classification_report(y_test, y_pred, target_names=class_names, output_dict=True)

        roc_auc = None
        try:
            if len(class_names) > 2:
                roc_auc = round(roc_auc_score(y_test, y_prob, multi_class='ovr'), 4)
        except:
            pass

        metrics = {
            'accuracy':  round(accuracy_score(y_test, y_pred), 4),
            'precision': round(precision_score(y_test, y_pred, average='weighted', zero_division=0), 4),
            'recall':    round(recall_score(y_test, y_pred, average='weighted', zero_division=0), 4),
            'f1':        round(f1_score(y_test, y_pred, average='weighted', zero_division=0), 4),
            'roc_auc':   roc_auc,
            'class_names': class_names,
            'n_test': len(y_test),
            'n_train': len(y_train),
            'n_total': len(y),
            'features': feature_cols,
            'report': report,
            'confusion_matrix': cm,
        }
        eval_metrics[target] = metrics

        # Save specific confusion matrix plot
        import seaborn as sns
        plot_dir = os.path.join(app.static_folder, 'plots')
        os.makedirs(plot_dir, exist_ok=True)
        img_filename = f'confusion_matrix_{target}.png'
        
        dark_bg = '#0f1117'
        text_col = '#c9d1d9'
        fig, ax = plt.subplots(figsize=(6, 5), dpi=150)
        fig.patch.set_facecolor(dark_bg)
        ax.set_facecolor(dark_bg)
        sns.heatmap(
            confusion_matrix(y_test, y_pred),
            annot=True, fmt='d', cmap='Blues',
            xticklabels=class_names, yticklabels=class_names,
            ax=ax, linewidths=0.5
        )
        ax.set_title(f'Confusion Matrix ({target.capitalize()})', color=text_col)
        ax.tick_params(colors=text_col)
        ax.set_xlabel('Predicted', color=text_col)
        ax.set_ylabel('Actual', color=text_col)
        plt.tight_layout()
        plt.savefig(os.path.join(plot_dir, img_filename))
        plt.close('all')

    except Exception as e:
        print(f"[Auto-train error] {e}")
        eval_metrics = None

@app.route('/dashboard')
def dashboard():
    global data_df
    if data_df is None:
        return redirect(url_for('index'))
    process_data()
    stats = {
        'avg_burnout': round(data_df['burnout_score'].mean(), 1),
        'median_burnout': round(data_df['burnout_score'].median(), 1),
        'std_burnout': round(data_df['burnout_score'].std(), 1),
        'total_records': len(data_df),
        'high_risk_count': int((data_df['risk'] == 'High').sum()),
        'pct_high_risk': round((data_df['risk'] == 'High').sum() / len(data_df) * 100, 1),
        'avg_sentiment': round(data_df['sentiment_score'].mean(), 2)
    }
    return render_template(
        'dashboard.html',
        data=data_df.to_dict('records'),
        columns=data_df.columns.tolist(),
        active_page='dashboard',
        **stats
    )


@app.route('/evaluate')
def evaluate():
    global eval_metrics
    target = request.args.get('dataset', 'primary')
    if target not in ['primary', 'compare']:
        target = 'primary'
    
    metrics = eval_metrics.get(target)
    
    if metrics is None and data_df is None:
        return render_template(
            'evaluation.html',
            error="No dataset loaded yet. Upload a CSV from the Home page first.",
            active_page='evaluate'
        )
    
    if metrics is None:
        # dataset is loaded but somehow metrics are missing — re-run
        _auto_train(target)
        metrics = eval_metrics.get(target)

    if metrics is None:
        return render_template(
            'evaluation.html',
            error=f"Could not train the model on the {target} dataset. Check that it has valid numeric columns.",
            active_page='evaluate',
            target=target
        )
    
    return render_template(
        'evaluation.html', 
        metrics=metrics, 
        active_page='evaluate',
        target=target,
        primary_exists=(eval_metrics['primary'] is not None),
        compare_exists=(eval_metrics['compare'] is not None)
    )


@app.route('/results')
def results():
    global data_df, eval_metrics
    if data_df is None:
        return redirect(url_for('index'))
    return render_template(
        'results.html',
        active_page='results',
        avg_burnout=round(data_df['burnout_score'].mean(), 2) if 'burnout_score' in data_df.columns else None,
        high_risk_pct=round((len(data_df[data_df['risk'] == 'High']) / len(data_df) * 100), 1) if 'risk' in data_df.columns else None,
        avg_sentiment=round(data_df['sentiment_score'].mean(), 2) if 'sentiment_score' in data_df.columns else None,
        metrics=eval_metrics['primary']
    )

@app.route('/edit', methods=['GET', 'POST'])
def edit():
    global data_df
    if data_df is None:
        return redirect(url_for('index'))
    if request.method == 'POST':
        submitted_rows = set()
        for key in request.form:
            if '_' in key:
                _, row_str = key.rsplit('_', 1)
                submitted_rows.add(int(row_str))

        if submitted_rows:
            max_row = max(submitted_rows)
            if max_row >= len(data_df):
                new_rows = max_row - len(data_df) + 1
                new_df = pd.DataFrame(index=range(len(data_df), len(data_df) + new_rows), columns=data_df.columns)
                data_df = pd.concat([data_df, new_df], ignore_index=False)

            for key in request.form:
                if '_' in key:
                    col, row_str = key.rsplit('_', 1)
                    i = int(row_str)
                    value = request.form[key].strip()
                    try:
                        if col in data_df.columns:
                            data_df.at[i, col] = (
                                pd.to_numeric(value, errors='coerce')
                                if pd.api.types.is_numeric_dtype(data_df[col]) else value
                            )
                    except:
                        pass

            process_data()
            os.makedirs('data', exist_ok=True)
            data_df.to_csv('data/updated_sample.csv', index=False)
            flash("Dataset updated and metrics recalculated successfully.", "success")
        return redirect(url_for('dashboard'))
    return render_template(
        'edit.html',
        data=data_df.to_dict('records'),
        columns=data_df.columns.tolist(),
        data_length=len(data_df),
        active_page='dashboard'
    )


def _build_stats(df):
    """Compute summary stats dict for one dataset."""
    if 'feedback' in df.columns:
        df = df.copy()
        df['sentiment_score'] = df['feedback'].apply(lambda x: sia.polarity_scores(str(x))['compound'])
    for col in ['sleep_hours', 'study_hours', 'stress_level']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    if 'burnout_score' not in df.columns:
        df['burnout_score'] = df.apply(
            lambda r: ((r.get('study_hours', 0) / r.get('sleep_hours', 1)
                        if r.get('sleep_hours', 0) > 0 else 0) * r.get('stress_level', 0)) * 10,
            axis=1
        )
        df['burnout_score'] = np.clip(df['burnout_score'], 0, 100)
    if 'risk' not in df.columns:
        df['risk'] = pd.cut(df['burnout_score'], bins=[-1, 33, 66, 101], labels=['Low', 'Medium', 'High'])
    risk_counts = df['risk'].value_counts().reindex(['Low', 'Medium', 'High'], fill_value=0)
    return {
        'n': len(df),
        'avg_burnout': round(df['burnout_score'].mean(), 2),
        'median_burnout': round(df['burnout_score'].median(), 2),
        'std_burnout': round(df['burnout_score'].std(), 2),
        'high_risk': int(risk_counts.get('High', 0)),
        'medium_risk': int(risk_counts.get('Medium', 0)),
        'low_risk': int(risk_counts.get('Low', 0)),
        'pct_high': round(risk_counts.get('High', 0) / max(len(df), 1) * 100, 1),
        'avg_sleep': round(df['sleep_hours'].mean(), 2) if 'sleep_hours' in df.columns else None,
        'avg_study': round(df['study_hours'].mean(), 2) if 'study_hours' in df.columns else None,
        'avg_stress': round(df['stress_level'].mean(), 2) if 'stress_level' in df.columns else None,
        'avg_sentiment': round(df.get('sentiment_score', pd.Series([0])).mean(), 3),
        '_df': df,
    }


def _generate_compare_plots(stats_a, stats_b, label_a, label_b):
    """Generate 5 comparison plots saved to static/plots/cmp_*.png."""
    plot_dir = os.path.join(app.static_folder, 'plots')
    os.makedirs(plot_dir, exist_ok=True)

    dark_bg  = '#0f1117'
    text_col = '#c9d1d9'
    grid_col = '#30363d'
    col_a    = '#4facfe'
    col_b    = '#ff9f43'

    def _ax(fig, ax):
        fig.patch.set_facecolor(dark_bg)
        ax.set_facecolor(dark_bg)
        ax.tick_params(colors=text_col, labelsize=9)
        for sp in ax.spines.values():
            sp.set_edgecolor(grid_col)
        ax.yaxis.label.set_color(text_col)
        ax.xaxis.label.set_color(text_col)
        ax.title.set_color(text_col)
        ax.grid(True, color=grid_col, linestyle='--', linewidth=0.5, alpha=0.6)

    df_a = stats_a['_df']
    df_b = stats_b['_df']

    # 1. Overlaid burnout histograms
    fig, ax = plt.subplots(figsize=(8, 4), dpi=150)
    _ax(fig, ax)
    ax.hist(df_a['burnout_score'], bins=20, color=col_a, alpha=0.6, edgecolor='none', label=label_a)
    ax.hist(df_b['burnout_score'], bins=20, color=col_b, alpha=0.6, edgecolor='none', label=label_b)
    ax.legend(facecolor=dark_bg, labelcolor=text_col, edgecolor=grid_col)
    ax.set_title('Burnout Score Distribution — Overlay')
    ax.set_xlabel('Burnout Score')
    ax.set_ylabel('Students')
    plt.tight_layout()
    plt.savefig(os.path.join(plot_dir, 'cmp_burnout_hist.png'))
    plt.close('all')

    # 2. Risk breakdown side-by-side bar
    fig, ax = plt.subplots(figsize=(7, 4), dpi=150)
    _ax(fig, ax)
    cats = ['Low', 'Medium', 'High']
    va = [stats_a['low_risk'], stats_a['medium_risk'], stats_a['high_risk']]
    vb = [stats_b['low_risk'], stats_b['medium_risk'], stats_b['high_risk']]
    x = np.arange(len(cats))
    w = 0.35
    ax.bar(x - w/2, va, w, color=col_a, alpha=0.85, label=label_a, edgecolor='none')
    ax.bar(x + w/2, vb, w, color=col_b, alpha=0.85, label=label_b, edgecolor='none')
    ax.set_xticks(x)
    ax.set_xticklabels(cats)
    ax.legend(facecolor=dark_bg, labelcolor=text_col, edgecolor=grid_col)
    ax.set_title('Risk Tier Count Comparison')
    ax.set_ylabel('Number of Students')
    plt.tight_layout()
    plt.savefig(os.path.join(plot_dir, 'cmp_risk_bar.png'))
    plt.close('all')

    # 3. Feature averages radar-style bar
    feature_labels = ['Avg Sleep\n(hrs)', 'Avg Study\n(hrs)', 'Avg Stress\n(/10)', 'Avg Burnout\n(/100)']
    scale = [10, 10, 10, 100]   # normalise to 0-1 for fair visual comparison
    def _safe(v, s): return (v or 0) / s
    raw_a = [stats_a['avg_sleep'], stats_a['avg_study'], stats_a['avg_stress'], stats_a['avg_burnout']]
    raw_b = [stats_b['avg_sleep'], stats_b['avg_study'], stats_b['avg_stress'], stats_b['avg_burnout']]
    na = [_safe(v, s) for v, s in zip(raw_a, scale)]
    nb = [_safe(v, s) for v, s in zip(raw_b, scale)]
    fig, ax = plt.subplots(figsize=(8, 4), dpi=150)
    _ax(fig, ax)
    xf = np.arange(len(feature_labels))
    ax.bar(xf - w/2, na, w, color=col_a, alpha=0.85, label=label_a, edgecolor='none')
    ax.bar(xf + w/2, nb, w, color=col_b, alpha=0.85, label=label_b, edgecolor='none')
    for xi, (a, b, ra, rb) in enumerate(zip(na, nb, raw_a, raw_b)):
        ax.text(xi - w/2, a + 0.01, f'{ra or 0:.1f}', ha='center', va='bottom', fontsize=7, color=col_a)
        ax.text(xi + w/2, b + 0.01, f'{rb or 0:.1f}', ha='center', va='bottom', fontsize=7, color=col_b)
    ax.set_xticks(xf)
    ax.set_xticklabels(feature_labels)
    ax.set_ylabel('Normalised Value (0–1)')
    ax.set_ylim(0, 1.2)
    ax.legend(facecolor=dark_bg, labelcolor=text_col, edgecolor=grid_col)
    ax.set_title('Key Feature Averages — Scaled Comparison')
    plt.tight_layout()
    plt.savefig(os.path.join(plot_dir, 'cmp_features.png'))
    plt.close('all')

    # 4. Burnout score boxplots side by side
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    _ax(fig, ax)
    bp = ax.boxplot(
        [df_a['burnout_score'].dropna(), df_b['burnout_score'].dropna()],
        tick_labels=[label_a, label_b], patch_artist=True,
        medianprops={'color': '#fff', 'linewidth': 2}
    )
    for patch, color in zip(bp['boxes'], [col_a, col_b]):
        patch.set_facecolor(color)
        patch.set_alpha(0.7)
    for element in ['whiskers', 'caps']:
        for item in bp[element]:
            item.set_color(text_col)
    ax.set_title('Burnout Score Spread — Side by Side')
    ax.set_ylabel('Burnout Score')
    plt.tight_layout()
    plt.savefig(os.path.join(plot_dir, 'cmp_boxplot.png'))
    plt.close('all')

    # 5. Sentiment distribution overlay
    if 'sentiment_score' in df_a.columns and 'sentiment_score' in df_b.columns:
        fig, ax = plt.subplots(figsize=(8, 4), dpi=150)
        _ax(fig, ax)
        ax.hist(df_a['sentiment_score'], bins=15, color=col_a, alpha=0.6, edgecolor='none', label=label_a)
        ax.hist(df_b['sentiment_score'], bins=15, color=col_b, alpha=0.6, edgecolor='none', label=label_b)
        ax.axvline(0, color=text_col, linestyle='--', linewidth=0.8, alpha=0.6)
        ax.legend(facecolor=dark_bg, labelcolor=text_col, edgecolor=grid_col)
        ax.set_title('Sentiment Score Distribution — Overlay')
        ax.set_xlabel('VADER Compound Score')
        ax.set_ylabel('Students')
        plt.tight_layout()
        plt.savefig(os.path.join(plot_dir, 'cmp_sentiment.png'))
        plt.close('all')


@app.route('/compare')
def compare():
    global data_df, compare_df, compare_meta
    return render_template(
        'compare.html',
        active_page='compare',
        primary_loaded=data_df is not None,
        compare_loaded=compare_df is not None,
        compare_meta=compare_meta,
    )


@app.route('/compare/upload', methods=['POST'])
def compare_upload():
    global data_df, compare_df, compare_meta
    if data_df is None:
        return redirect(url_for('index'))
    if 'file' not in request.files or request.files['file'].filename == '':
        return redirect(url_for('compare'))
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return redirect(url_for('compare'))
    try:
        cdf = pd.read_csv(file)
        # Apply same preprocessing
        for col in ['sleep_hours', 'study_hours', 'stress_level']:
            if col in cdf.columns:
                cdf[col] = pd.to_numeric(cdf[col], errors='coerce').fillna(0)
                cdf[col] = cdf[col].apply(lambda x: max(x, 0))
        cdf['burnout_score'] = cdf.apply(
            lambda r: ((r.get('study_hours', 0) / r.get('sleep_hours', 1)
                        if r.get('sleep_hours', 0) > 0 else 0) * r.get('stress_level', 0)) * 10,
            axis=1
        )
        cdf['burnout_score'] = np.clip(cdf['burnout_score'], 0, 100)
        cdf['risk'] = pd.cut(cdf['burnout_score'], bins=[-1, 33, 66, 101], labels=['Low', 'Medium', 'High'])
        if 'feedback' in cdf.columns:
            cdf['sentiment_score'] = cdf['feedback'].apply(lambda x: sia.polarity_scores(str(x))['compound'])
        compare_df = cdf
        compare_meta = {'filename': file.filename, 'records': len(cdf)}
        
        # Trigger evaluation for the comparison dataset
        _auto_train('compare')
        
        return redirect(url_for('compare_results'))
    except Exception as e:
        print(f"Compare upload error: {e}")
        flash(f"Error processing comparison file: {e}", "danger")
        return redirect(url_for('compare'))


@app.route('/compare/results')
def compare_results():
    global data_df, compare_df, compare_meta
    if data_df is None or compare_df is None:
        return redirect(url_for('compare'))

    label_a = session.get('history', [{}])[0].get('filename', 'Dataset A') if session.get('history') else 'Dataset A'
    label_b = compare_meta.get('filename', 'Dataset B')

    stats_a = _build_stats(data_df.copy())
    stats_b = _build_stats(compare_df.copy())
    _generate_compare_plots(stats_a, stats_b, label_a, label_b)

    # Strip internal _df before sending to template
    def _strip(s):
        return {k: v for k, v in s.items() if k != '_df'}

    # Compute deltas
    def _delta(a, b):
        if a is None or b is None:
            return None
        return round(b - a, 2)

    deltas = {
        'avg_burnout':  _delta(stats_a['avg_burnout'],  stats_b['avg_burnout']),
        'pct_high':     _delta(stats_a['pct_high'],     stats_b['pct_high']),
        'avg_sleep':    _delta(stats_a['avg_sleep'],    stats_b['avg_sleep']),
        'avg_study':    _delta(stats_a['avg_study'],    stats_b['avg_study']),
        'avg_stress':   _delta(stats_a['avg_stress'],   stats_b['avg_stress']),
        'avg_sentiment':_delta(stats_a['avg_sentiment'],stats_b['avg_sentiment']),
    }

    return render_template(
        'compare.html',
        active_page='compare',
        primary_loaded=True,
        compare_loaded=True,
        compare_meta=compare_meta,
        label_a=label_a,
        label_b=label_b,
        stats_a=_strip(stats_a),
        stats_b=_strip(stats_b),
        deltas=deltas,
    )


@app.route('/compare/clear')
def compare_clear():
    global compare_df, compare_meta, eval_metrics
    compare_df = None
    compare_meta = None
    eval_metrics['compare'] = None
    return redirect(url_for('compare'))


if __name__ == '__main__':
    # app.run(debug=True)
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)