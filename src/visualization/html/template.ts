// src/visualization/html/template.ts - HTML 报告模板 (T032, T052)

/**
 * HTML 报告模板 - 增强版支持 rawOutput drill-down
 */
export const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Benchmark Report - {{runId}}</title>
  <style>
    :root {
      --bg: #f5f5f5;
      --card-bg: #ffffff;
      --text: #333333;
      --text-muted: #666666;
      --border: #e0e0e0;
      --success: #4caf50;
      --error: #f44336;
      --warning: #ff9800;
      --info: #2196f3;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      background: var(--card-bg);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    header h1 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    header .meta {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .card h2 {
      font-size: 1.2rem;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    th {
      background: #fafafa;
      font-weight: 600;
    }

    tr:hover {
      background: #fafafa;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-tp { background: #e8f5e9; color: #2e7d32; }
    .badge-tn { background: #e3f2fd; color: #1565c0; }
    .badge-fp { background: #fff3e0; color: #ef6c00; }
    .badge-fn { background: #ffebee; color: #c62828; }
    .badge-error { background: #fce4ec; color: #ad1457; }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .metric-item {
      text-align: center;
      padding: 15px;
      background: #fafafa;
      border-radius: 6px;
    }

    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--info);
    }

    .metric-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 5px;
    }

    .ranking-row {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
    }

    .ranking-row:last-child {
      border-bottom: none;
    }

    .rank-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--info);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin-right: 15px;
    }

    .rank-number.gold { background: #ffd700; color: #333; }
    .rank-number.silver { background: #c0c0c0; color: #333; }
    .rank-number.bronze { background: #cd7f32; color: #fff; }

    .agent-name {
      font-weight: 600;
      flex: 1;
    }

    .agent-score {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--info);
    }

    .filter-bar {
      margin-bottom: 15px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 6px 12px;
      border: 1px solid var(--border);
      background: var(--card-bg);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .filter-btn:hover {
      background: #f0f0f0;
    }

    .filter-btn.active {
      background: var(--info);
      color: white;
      border-color: var(--info);
    }

    /* Modal Styles */
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      overflow: auto;
    }

    .modal-content {
      background: var(--card-bg);
      margin: 5% auto;
      padding: 20px;
      border-radius: 8px;
      width: 90%;
      max-width: 900px;
      max-height: 85vh;
      overflow: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }

    .modal-header h3 {
      font-size: 1.1rem;
    }

    .close-btn {
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-muted);
      background: none;
      border: none;
      padding: 0;
      line-height: 1;
    }

    .close-btn:hover {
      color: var(--text);
    }

    .detail-section {
      margin-bottom: 20px;
    }

    .detail-section h4 {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .detail-content {
      background: #f5f5f5;
      border-radius: 4px;
      padding: 12px;
      font-family: monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 200px;
      overflow-y: auto;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .detail-list {
      list-style: none;
    }

    .detail-list li {
      padding: 5px 0;
      border-bottom: 1px solid var(--border);
    }

    .detail-list li:last-child {
      border-bottom: none;
    }

    .expandable-cell {
      cursor: pointer;
      position: relative;
    }

    .expandable-cell:hover {
      text-decoration: underline;
    }

    .expand-icon {
      font-size: 0.7rem;
      margin-left: 4px;
      opacity: 0.6;
    }

    @media (max-width: 768px) {
      .metric-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .detail-grid {
        grid-template-columns: 1fr;
      }
      .modal-content {
        margin: 2% auto;
        width: 95%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎯 UI Testing Agent Benchmark Report</h1>
      <div class="meta">
        <strong>Run ID:</strong> {{runId}} &nbsp;|&nbsp;
        <strong>Generated:</strong> {{generatedAt}} &nbsp;|&nbsp;
        <strong>Total Cases:</strong> {{totalCases}} &nbsp;|&nbsp;
        <strong>Agents:</strong> {{totalAgents}}
      </div>
    </header>

    <div class="card">
      <h2>🏆 Agent Ranking (by F1 Score)</h2>
      <div id="ranking">
        {{rankingHtml}}
      </div>
    </div>

    <div class="card">
      <h2>📊 Metrics by Agent</h2>
      {{metricsHtml}}
    </div>

    <div class="card">
      <h2>📋 Case-Level Results</h2>
      <div class="filter-bar">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="TP">TP</button>
        <button class="filter-btn" data-filter="TN">TN</button>
        <button class="filter-btn" data-filter="FP">FP</button>
        <button class="filter-btn" data-filter="FN">FN</button>
        <button class="filter-btn" data-filter="ERROR">ERROR</button>
      </div>
      <table id="results-table">
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Scene</th>
            <th>Prompt</th>
            <th>Ground Truth</th>
            {{agentHeaders}}
          </tr>
        </thead>
        <tbody>
          {{resultsHtml}}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Detail Modal -->
  <div id="detail-modal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modal-title">Case Details</h3>
        <button class="close-btn" onclick="closeModal()">&times;</button>
      </div>
      <div id="modal-body"></div>
    </div>
  </div>

  <script>
    // Case data for modal display
    const caseData = {{caseDataJson}};

    // Filter functionality
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        const rows = document.querySelectorAll('#results-table tbody tr');
        
        rows.forEach(row => {
          if (filter === 'all') {
            row.style.display = '';
          } else {
            const badges = row.querySelectorAll('.badge');
            const hasMatch = Array.from(badges).some(b => 
              b.classList.contains('badge-' + filter.toLowerCase())
            );
            row.style.display = hasMatch ? '' : 'none';
          }
        });
      });
    });

    // Modal functionality
    function showDetail(caseId, agentName) {
      const key = caseId + '::' + agentName;
      const data = caseData[key];
      if (!data) return;

      document.getElementById('modal-title').textContent = 
        'Case: ' + caseId + ' | Agent: ' + agentName;

      let html = '<div class="detail-grid">';
      
      // Left column - Ground Truth
      html += '<div class="detail-section">';
      html += '<h4>Ground Truth</h4>';
      html += '<div class="detail-content">';
      html += 'Has Defect: ' + (data.groundTruth.has_defect ? 'Yes' : 'No') + '\\n';
      html += 'Defect Details:\\n';
      if (data.groundTruth.defect_details && data.groundTruth.defect_details.length > 0) {
        data.groundTruth.defect_details.forEach((d, i) => {
          html += '  ' + (i + 1) + '. ' + d + '\\n';
        });
      } else {
        html += '  (none)';
      }
      html += '</div></div>';

      // Right column - Agent Output
      html += '<div class="detail-section">';
      html += '<h4>Agent Output</h4>';
      html += '<div class="detail-content">';
      html += 'Predicted Defect: ' + (data.prediction.has_defect ? 'Yes' : 'No') + '\\n';
      html += 'Result: <span class="badge badge-' + data.label.toLowerCase() + '">' + data.label + '</span>\\n';
      html += 'Defect Details:\\n';
      if (data.prediction.defect_details && data.prediction.defect_details.length > 0) {
        data.prediction.defect_details.forEach((d, i) => {
          html += '  ' + (i + 1) + '. ' + d + '\\n';
        });
      } else {
        html += '  (none)';
      }
      html += '</div></div>';
      html += '</div>';

      // Raw Output Section
      html += '<div class="detail-section">';
      html += '<h4>Raw Output</h4>';
      html += '<div class="detail-content">' + escapeHtml(data.rawOutput || '(no output)') + '</div>';
      html += '</div>';

      // Prompt Section
      html += '<div class="detail-section">';
      html += '<h4>Test Prompt</h4>';
      html += '<div class="detail-content">' + escapeHtml(data.prompt || '') + '</div>';
      html += '</div>';

      // Error Section (if any)
      if (data.error) {
        html += '<div class="detail-section">';
        html += '<h4>Error Details</h4>';
        html += '<div class="detail-content" style="background: #ffebee;">' + escapeHtml(data.error) + '</div>';
        html += '</div>';
      }

      // Execution Info
      html += '<div class="detail-section">';
      html += '<h4>Execution Info</h4>';
      html += '<div class="detail-content">';
      html += 'Duration: ' + (data.durationMs || 0) + 'ms\\n';
      html += 'Success: ' + (data.success ? 'Yes' : 'No');
      html += '</div></div>';

      document.getElementById('modal-body').innerHTML = html;
      document.getElementById('detail-modal').style.display = 'block';
    }

    function closeModal() {
      document.getElementById('detail-modal').style.display = 'none';
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Close modal on outside click
    window.onclick = function(event) {
      const modal = document.getElementById('detail-modal');
      if (event.target === modal) {
        closeModal();
      }
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeModal();
      }
    });
  </script>
</body>
</html>
`;

/**
 * 生成排名 HTML
 */
export function generateRankingHtml(ranking: Array<{ rank: number; agentName: string; f1: number }>): string {
  return ranking
    .map((r) => {
      let rankClass = '';
      if (r.rank === 1) rankClass = 'gold';
      else if (r.rank === 2) rankClass = 'silver';
      else if (r.rank === 3) rankClass = 'bronze';

      return `
        <div class="ranking-row">
          <div class="rank-number ${rankClass}">${r.rank}</div>
          <div class="agent-name">${escapeHtml(r.agentName)}</div>
          <div class="agent-score">F1: ${(r.f1 * 100).toFixed(1)}%</div>
        </div>
      `;
    })
    .join('');
}

/**
 * 生成指标 HTML
 */
export function generateMetricsHtml(
  metrics: Array<{
    agentName: string;
    precision: number;
    recall: number;
    f1: number;
    missRate: number;
    accuracy: number;
    errorRate: number;
    counts: Record<string, number>;
  }>
): string {
  return metrics
    .map(
      (m) => `
      <div style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 10px;">${escapeHtml(m.agentName)}</h3>
        <div class="metric-grid">
          <div class="metric-item">
            <div class="metric-value">${(m.precision * 100).toFixed(1)}%</div>
            <div class="metric-label">Precision</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${(m.recall * 100).toFixed(1)}%</div>
            <div class="metric-label">Recall</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${(m.f1 * 100).toFixed(1)}%</div>
            <div class="metric-label">F1 Score</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${(m.missRate * 100).toFixed(1)}%</div>
            <div class="metric-label">Miss Rate</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${(m.accuracy * 100).toFixed(1)}%</div>
            <div class="metric-label">Accuracy</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${m.counts.TP}/${m.counts.FP}/${m.counts.FN}/${m.counts.TN}</div>
            <div class="metric-label">TP/FP/FN/TN</div>
          </div>
        </div>
      </div>
    `
    )
    .join('');
}

/**
 * 截断文本并添加省略号
 */
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

/**
 * 生成结果行 HTML - 增强版支持 drill-down
 */
export function generateResultRowHtml(
  caseId: string,
  sceneId: string,
  prompt: string,
  groundTruth: boolean,
  agentResults: Array<{ agentName: string; label: string }>
): string {
  const gtText = groundTruth ? '有缺陷' : '无缺陷';
  const promptPreview = truncate(prompt, 50);
  const agentCells = agentResults
    .map((r) => {
      const badgeClass = `badge-${r.label.toLowerCase()}`;
      return `<td class="expandable-cell" onclick="showDetail('${escapeHtml(caseId)}', '${escapeHtml(r.agentName)}')">
        <span class="badge ${badgeClass}">${r.label}</span>
        <span class="expand-icon">🔍</span>
      </td>`;
    })
    .join('');

  return `
    <tr>
      <td>${escapeHtml(caseId)}</td>
      <td>${escapeHtml(sceneId)}</td>
      <td title="${escapeHtml(prompt)}">${escapeHtml(promptPreview)}</td>
      <td>${gtText}</td>
      ${agentCells}
    </tr>
  `;
}

/**
 * 生成用于 modal 显示的 case 数据 JSON
 */
export interface CaseDetailData {
  groundTruth: {
    has_defect: boolean;
    defect_details: string[];
  };
  prediction: {
    has_defect: boolean;
    defect_details: string[];
  };
  rawOutput: string;
  prompt: string;
  label: string;
  success: boolean;
  durationMs?: number;
  error?: string;
}

export function generateCaseDataJson(caseData: Record<string, CaseDetailData>): string {
  return JSON.stringify(caseData);
}

/**
 * HTML 转义
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
