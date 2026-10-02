(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const colors = { blue: '#2769df', violet: '#8065c7', coral: '#f47f69', gold: '#d9a334', teal: '#4baea2', line: '#dedbd2', ink: '#10182f' };
  const money = (value) => `$${Number(value).toFixed(value >= 100 ? 1 : 2)}M`;
  const dollars = (value) => `$${Math.round(Number(value)).toLocaleString('en-US')}`;
  const bigMoney = (value) => `$${(Number(value) / 1000).toFixed(2)}B`;
  const integer = (value) => Math.round(Number(value)).toLocaleString('en-US');
  const percent = (value) => `${Number(value).toFixed(1)}%`;

  function setStat(name, value) { document.querySelectorAll(`[data-stat="${name}"]`).forEach((node) => { node.textContent = value; }); }
  function svgFrame(target, width = 720, height = 360, label = 'Data visualization') {
    if (!target) return null;
    target.innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMinYMin meet" overflow="visible" role="img" aria-label="${label}"></svg>`;
    return target.querySelector('svg');
  }
  function el(name, attrs = {}, parent) { const node = document.createElementNS(NS, name); Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value)); if (parent) parent.appendChild(node); return node; }
  function text(svg, x, y, value, className = '', anchor = 'start') { const node = el('text', { x, y, class: className, 'text-anchor': anchor }, svg); node.appendChild(document.createTextNode(value)); return node; }
  function valueText(svg, x, y, value, className = 'bar-label', width = 720) { const nearEdge = x > width - 104; return text(svg, nearEdge ? width - 8 : x, y, value, className, nearEdge ? 'end' : 'start'); }
  function title(node, value) { el('title', {}, node).textContent = value; }
  function empty(target, message) { if (target) target.innerHTML = `<div class="chart-empty">${message}</div>`; }

  function barChart(target, rows, options = {}) {
    if (!rows.length) return empty(target, 'No rows are available for this view.');
    const width = 720; const rowHeight = options.rowHeight || 34; const height = Math.max(250, rows.length * rowHeight + 64); const left = options.left || 160; const right = options.right || 112; const top = 28; const plot = width - left - right; const max = options.max || Math.max(...rows.map((row) => row.value), 1); const formatter = options.valueFormat || ((value) => value.toLocaleString()); const svg = svgFrame(target, width, height, options.label || 'Horizontal bar chart');
    [0, .5, 1].forEach((fraction) => { const x = left + plot * fraction; el('line', { x1: x, y1: top - 12, x2: x, y2: height - 24, class: 'grid-line' }, svg); text(svg, x, 16, formatter(max * fraction), 'axis-label axis-number', 'middle'); });
    rows.forEach((row, index) => { const y = top + index * rowHeight; const value = Number(row.value) || 0; const color = row.color || colors.blue; text(svg, left - 12, y + 17, row.label, 'axis-label axis-left', 'end'); const bar = el('rect', { x: left, y: y + 3, width: Math.max(0, plot * value / max), height: 20, rx: 4, class: 'bar', fill: color }, svg); title(bar, `${row.label}: ${formatter(value)}`); valueText(svg, left + plot * value / max + 8, y + 18, formatter(value), 'bar-label', width); });
  }

  function donutChart(target, rows, options = {}) {
    if (!rows.length) return empty(target, 'No rows are available for this view.');
    const width = 720; const height = options.height || 300; const svg = svgFrame(target, width, height, options.label || 'Donut chart'); const cx = 210; const cy = height / 2; const radius = 83; const circumference = 2 * Math.PI * radius; const total = rows.reduce((sum, row) => sum + Number(row.value || 0), 0); let offset = 0;
    el('circle', { cx, cy, r: radius, fill: 'none', stroke: '#eeebe3', 'stroke-width': 28 }, svg);
    rows.forEach((row) => { const length = circumference * Number(row.value || 0) / total; const segment = el('circle', { cx, cy, r: radius, class: 'donut-segment', stroke: row.color || colors.blue, 'stroke-dasharray': `${length} ${circumference - length}`, 'stroke-dashoffset': -offset }, svg); title(segment, `${row.label}: ${percent(100 * row.value / total)}`); offset += length; });
    text(svg, cx, cy - 3, options.centerTop || 'share', 'axis-label', 'middle'); text(svg, cx, cy + 22, options.centerBottom || 'of market', 'chart-value', 'middle');
    rows.forEach((row, index) => { const y = 64 + index * 37; el('circle', { cx: 380, cy: y - 4, r: 5, fill: row.color || colors.blue }, svg); text(svg, 394, y, row.label, 'axis-label'); text(svg, 692, y, `${percent(100 * row.value / total)} · ${options.valueFormat ? options.valueFormat(row.value) : integer(row.value)}`, 'chart-value', 'end'); });
  }

  function lollipopChart(target, rows, options = {}) {
    if (!rows.length) return empty(target, 'No rows are available for this view.');
    const width = 720; const rowHeight = options.rowHeight || 30; const height = Math.max(270, rows.length * rowHeight + 65); const left = options.left || 170; const right = 92; const plot = width - left - right; const max = options.max || Math.max(...rows.map((row) => row.value), 1); const formatter = options.valueFormat || ((value) => value.toLocaleString()); const svg = svgFrame(target, width, height, options.label || 'Lollipop ranking');
    [0, .5, 1].forEach((fraction) => { const x = left + plot * fraction; el('line', { x1: x, y1: 16, x2: x, y2: height - 24, class: 'grid-line' }, svg); text(svg, x, 12, formatter(max * fraction), 'axis-label axis-number', 'middle'); });
    rows.forEach((row, index) => { const y = 32 + index * rowHeight; const x = left + plot * Number(row.value) / max; text(svg, left - 12, y + 4, row.label, 'axis-label axis-left', 'end'); el('line', { x1: left, y1: y, x2: x, y2: y, class: 'lollipop-line' }, svg); const dot = el('circle', { cx: x, cy: y, r: 7, class: 'chart-dot', fill: row.color || colors.blue }, svg); title(dot, `${row.label}: ${formatter(row.value)}`); valueText(svg, x + 12, y + 4, formatter(row.value), 'chart-value', width); });
  }

  function dumbbellChart(target, rows, options = {}) {
    if (!rows.length) return empty(target, 'No rows are available for this view.');
    const width = 720; const rowHeight = 52; const height = rows.length * rowHeight + 66; const left = 150; const right = 105; const plot = width - left - right; const max = options.max || Math.max(...rows.flatMap((row) => [row.total, row.median]), 1); const formatter = options.valueFormat || money; const svg = svgFrame(target, width, height, 'Dumbbell comparison chart');
    [0, .5, 1].forEach((fraction) => { const x = left + plot * fraction; el('line', { x1: x, y1: 13, x2: x, y2: height - 28, class: 'grid-line' }, svg); text(svg, x, 10, formatter(max * fraction), 'axis-label axis-number', 'middle'); });
    rows.forEach((row, index) => { const y = 39 + index * rowHeight; const x1 = left + plot * row.median / max; const x2 = left + plot * row.total / max; text(svg, left - 12, y + 4, row.label, 'axis-label axis-left', 'end'); el('line', { x1: x1, y1: y, x2: x2, y2: y, stroke: colors.line, 'stroke-width': 7, 'stroke-linecap': 'round' }, svg); const a = el('circle', { cx: x1, cy: y, r: 8, class: 'chart-dot', fill: colors.coral }, svg); const b = el('circle', { cx: x2, cy: y, r: 8, class: 'chart-dot', fill: colors.blue }, svg); title(a, `${row.label} median: ${formatter(row.median)}`); title(b, `${row.label} total: ${formatter(row.total)}`); text(svg, Math.min(width - 8, x2 + 13), y + 4, formatter(row.total), 'chart-value'); });
  }

  function stackedBarChart(target, rows, keys, options = {}) {
    if (!rows.length) return empty(target, 'No rows are available for this view.');
    const width = 720; const rowHeight = 52; const height = rows.length * rowHeight + 64; const left = 100; const right = 24; const plot = width - left - right; const svg = svgFrame(target, width, height, 'Stacked composition chart');
    rows.forEach((row, index) => { const y = 34 + index * rowHeight; text(svg, left - 12, y + 17, row.label, 'axis-label axis-left', 'end'); let cursor = left; keys.forEach((key) => { const value = Number(row[key]) || 0; const segmentWidth = plot * value / 100; const rect = el('rect', { x: cursor, y, width: segmentWidth, height: 25, rx: 4, class: 'bar', fill: options.colors[key] }, svg); title(rect, `${row.label} — ${key}: ${value.toFixed(1)}%`); if (segmentWidth > 38) text(svg, cursor + segmentWidth / 2, y + 17, `${Math.round(value)}%`, 'axis-label', 'middle'); cursor += segmentWidth; }); });
    text(svg, left, height - 12, '0%', 'axis-label'); text(svg, width - right, height - 12, '100%', 'axis-label', 'end');
  }

  function bubbleChart(target, rows, options = {}) {
    if (!rows.length) return empty(target, 'No rows are available for this view.');
    const width = 720; const height = 320; const svg = svgFrame(target, width, height, 'Bubble chart of conference leaders'); const left = 70; const right = 38; const bottom = 47; const top = 30; const plotWidth = width - left - right; const plotHeight = height - top - bottom; const max = options.max || Math.max(...rows.map((row) => row.value), 1);
    [0, .5, 1].forEach((fraction) => { const y = top + plotHeight * (1 - fraction); el('line', { x1: left, y1: y, x2: width - right, y2: y, class: 'grid-line' }, svg); text(svg, left - 9, y + 4, options.valueFormat(max * fraction), 'axis-label', 'end'); });
    rows.forEach((row, index) => { const x = left + plotWidth * (index + .5) / rows.length; const y = top + plotHeight * (1 - row.value / max); const radius = 15 + 22 * row.value / max; const bubble = el('circle', { cx: x, cy: y, r: radius, class: 'chart-dot', fill: row.color || colors.violet }, svg); title(bubble, `${row.label}: ${options.valueFormat(row.value)}`); text(svg, x, height - 22, row.short || row.label, 'axis-label', 'middle'); text(svg, x, y + 4, options.valueFormat(row.value), 'chart-value', 'middle'); });
  }

  function dotPlot(target, rows, options = {}) {
    if (!rows.length) return empty(target, 'No rows are available for this view.');
    const width = 720; const rowHeight = 29; const height = rows.length * rowHeight + 65; const left = 170; const right = 90; const plot = width - left - right; const max = options.max || Math.max(...rows.map((row) => row.value), 1); const svg = svgFrame(target, width, height, 'Position dot plot');
    [0, .5, 1].forEach((fraction) => { const x = left + plot * fraction; el('line', { x1: x, y1: 13, x2: x, y2: height - 24, class: 'grid-line' }, svg); text(svg, x, 11, options.valueFormat(max * fraction), 'axis-label axis-number', 'middle'); });
    rows.forEach((row, index) => { const y = 31 + index * rowHeight; const x = left + plot * row.value / max; text(svg, left - 12, y + 4, row.label, 'axis-label axis-left', 'end'); el('line', { x1: left, y1: y, x2: x, y2: y, stroke: '#eeebe3', 'stroke-width': 4 }, svg); const dot = el('circle', { cx: x, cy: y, r: 6, class: 'chart-dot', fill: row.color || colors.violet }, svg); title(dot, `${row.label}: ${options.valueFormat(row.value)}`); text(svg, Math.min(width - 7, x + 11), y + 4, options.valueFormat(row.value), 'chart-value'); });
  }

  function slopeChart(target, rows, options = {}) {
    if (!rows.length) return empty(target, 'No historical rows are available.');
    const width = 720; const height = 300; const svg = svgFrame(target, width, height, 'Two-year average and median comparison'); const left = 150; const right = 105; const yTop = 45; const yBottom = 240; const max = options.max || Math.max(...rows.flatMap((row) => [row.average, row.median]), 1); const x1 = left; const x2 = width - right;
    [0, .5, 1].forEach((fraction) => { const y = yBottom - (yBottom - yTop) * fraction; el('line', { x1: left - 10, y1: y, x2: x2 + 10, y2: y, class: 'grid-line' }, svg); text(svg, left - 19, y + 4, options.valueFormat(max * fraction), 'axis-label', 'end'); });
    rows.forEach((row, index) => { const yAvg = yBottom - (yBottom - yTop) * row.average / max; const yMedian = yBottom - (yBottom - yTop) * row.median / max; const line = el('line', { x1, y1: yAvg, x2, y2: yMedian, class: 'chart-line', stroke: index === 0 ? colors.blue : colors.coral }, svg); title(line, `${row.year}: average ${options.valueFormat(row.average)}, median ${options.valueFormat(row.median)}`); const a = el('circle', { cx: x1, cy: yAvg, r: 8, class: 'chart-point', fill: index === 0 ? colors.blue : colors.coral }, svg); const b = el('circle', { cx: x2, cy: yMedian, r: 8, class: 'chart-point', fill: index === 0 ? colors.blue : colors.coral }, svg); text(svg, x1 - 15, yAvg + 4, `${row.year} avg ${options.valueFormat(row.average)}`, 'chart-value', 'end'); text(svg, x2 + 15, yMedian + 4, `${row.year} median ${options.valueFormat(row.median)}`, 'chart-value'); title(a, `${row.year} average`); title(b, `${row.year} median`); });
    text(svg, x1, height - 20, 'average', 'axis-label', 'middle'); text(svg, x2, height - 20, 'median', 'axis-label', 'middle');
  }

  function multiYearLineChart(target, rows, options = {}) {
    if (!rows.length) return empty(target, 'No historical rows are available.');
    const width = 720; const height = options.height || 320; const left = 72; const right = 112; const top = 28; const bottom = 44; const plotWidth = width - left - right; const plotHeight = height - top - bottom; const years = [...new Set(rows.map((row) => row.year))]; const series = [...new Set(rows.map((row) => row.series))]; const max = options.max || Math.max(...rows.map((row) => Number(row.value) || 0), 1); const formatter = options.valueFormat || money; const palette = options.colors || [colors.blue, colors.coral, colors.violet, colors.teal]; const svg = svgFrame(target, width, height, options.label || 'Historical comparison chart');
    [0, .5, 1].forEach((fraction) => { const y = top + plotHeight * (1 - fraction); el('line', { x1: left, y1: y, x2: width - right, y2: y, class: 'grid-line' }, svg); text(svg, left - 10, y + 4, formatter(max * fraction), 'axis-label axis-number', 'end'); });
    years.forEach((year, index) => { const x = left + (years.length === 1 ? plotWidth / 2 : plotWidth * index / (years.length - 1)); text(svg, x, height - 14, year, 'axis-label axis-number', 'middle'); });
    series.forEach((name, seriesIndex) => { const color = palette[seriesIndex % palette.length]; const points = years.map((year, index) => { const row = rows.find((item) => item.series === name && item.year === year); const value = row ? Number(row.value) || 0 : NaN; const x = left + (years.length === 1 ? plotWidth / 2 : plotWidth * index / (years.length - 1)); const y = top + plotHeight * (1 - value / max); return { x, y, value, row }; }).filter((point) => Number.isFinite(point.value)); if (!points.length) return; if (points.length > 1) el('polyline', { points: points.map((point) => `${point.x},${point.y}`).join(' '), fill: 'none', stroke: color, 'stroke-width': 3, class: 'chart-line' }, svg); points.forEach((point) => { const dot = el('circle', { cx: point.x, cy: point.y, r: 5, class: 'chart-point', fill: color }, svg); title(dot, `${name} · ${point.row.year}: ${formatter(point.value)}`); if (options.labelPoints) text(svg, point.x, Math.max(18, point.y - 12), formatter(point.value), 'chart-value', 'middle'); }); if (!options.labelPoints) { const last = points[points.length - 1]; text(svg, Math.min(width - 8, last.x + 12), last.y + 4, `${name} ${formatter(last.value)}`, 'chart-value'); } });
  }

  function splitMetricChart(target, rows, options = {}) {
    if (!rows.length) return empty(target, 'No historical rows are available.');
    const width = 720; const height = options.height || 270; const left = 36; const right = 26; const gap = 28; const panelWidth = (width - left - right - gap) / 2; const formatter = options.formatter || dollars; const svg = svgFrame(target, width, height, options.label || 'Two-year metric comparison');
    const panels = options.panels || [
      { key: 'average', label: 'Average', color: colors.blue },
      { key: 'median', label: 'Median', color: colors.coral }
    ];
    rows.slice(0, 2).forEach((row, rowIndex) => {
      const panelLeft = left + rowIndex * (panelWidth + gap); const barLeft = panelLeft + 62; const plot = panelWidth - 70; text(svg, panelLeft, 20, `${row.label} snapshot`, 'chart-value'); if (row.dateRange) text(svg, panelLeft, 34, row.dateRange, 'axis-label');
      panels.forEach((panel, panelIndex) => {
        const top = 66 + panelIndex * 88; const axisMax = Math.max(...rows.map((item) => Number(item[panel.key]) || 0), 1); const value = Number(row[panel.key]) || 0; const x = barLeft + plot * value / axisMax; text(svg, panelLeft, top + 18, panel.label, 'axis-label axis-left'); [0, .5, 1].forEach((fraction) => { const gridX = barLeft + plot * fraction; el('line', { x1: gridX, y1: top - 11, x2: gridX, y2: top + 34, class: 'grid-line' }, svg); text(svg, gridX, top - 15, formatter(axisMax * fraction), 'axis-label axis-number', 'middle'); }); el('rect', { x: barLeft, y: top, width: Math.max(0, plot * value / axisMax), height: 20, rx: 4, class: 'bar', fill: panel.color }, svg); valueText(svg, x + 8, top + 15, formatter(value), 'bar-label', panelLeft + panelWidth);
      });
    });
  }

  function conferenceSuccessChart(target, rows, conferenceColor) {
    if (!rows.length) return empty(target, 'No football success rows are available.');
    const width = 720; const rowHeight = 28; const height = rows.length * rowHeight + 66; const left = 178; const right = 132; const top = 30; const plot = width - left - right; const max = Math.ceil(Math.max(...rows.map((row) => row.market_millions), 1) / 10) * 10; const svg = svgFrame(target, width, height, 'Estimated NIL market and win percentage chart');
    [0, .5, 1].forEach((fraction) => { const x = left + plot * fraction; el('line', { x1: x, y1: top - 13, x2: x, y2: height - 28, class: 'grid-line' }, svg); text(svg, x, 15, money(max * fraction), 'axis-label axis-number', 'middle'); });
    rows.slice().sort((a, b) => a.market_millions - b.market_millions).forEach((row, index) => { const y = top + index * rowHeight; const barWidth = plot * row.market_millions / max; const bar = el('rect', { x: left, y: y + 2, width: barWidth, height: 18, rx: 4, class: 'bar', fill: conferenceColor }, svg); title(bar, `${row.school}: ${money(row.market_millions)} all-sport NIL estimate in 2026 · ${row.record} in 2025`); text(svg, left - 12, y + 15, row.school, 'axis-label axis-left', 'end'); valueText(svg, left + barWidth + 8, y + 15, money(row.market_millions), 'bar-label', width - 100); text(svg, width - 8, y + 15, `${(100 * row.wins / (row.wins + row.losses)).toFixed(0)}%`, 'chart-value', 'end'); });
    text(svg, width - 8, 15, 'win %', 'axis-label axis-number', 'end');
  }

  function renderSegmentChart(target, rows) {
    if (!target) return;
    target.innerHTML = '<div class="chart-title"><strong>Disclosure share</strong><span>2025 snapshot · by segment</span></div><div class="chart-wrap segment-donut"></div><div class="chart-title"><strong>Average value</strong><span>2025 snapshot · dollars</span></div><div class="chart-wrap segment-bars"></div>';
    const palette = { 'Power 4': colors.blue, 'Group of 5': colors.gold, 'FCS / no football': colors.violet };
    donutChart(target.querySelector('.segment-donut'), rows.map((row) => ({ label: row.group, value: row.disclosure_count, color: palette[row.group] })), { centerTop: '2025', centerBottom: 'disclosures' });
    lollipopChart(target.querySelector('.segment-bars'), rows.map((row) => ({ label: row.group, value: row.average_disclosure_value, color: palette[row.group] })), { max: 7000, valueFormat: dollars, left: 185, rowHeight: 40 });
  }

  function renderSportMarketChart(target, data, p4) {
    const keys = ['Football', "Men's basketball", "Women's basketball", 'Baseball', 'Everything else']; const palette = { Football: colors.blue, "Men's basketball": colors.violet, Baseball: colors.gold, "Women's basketball": colors.coral, "Everything else": colors.teal }; const rows = keys.map((sport) => ({ label: sport, value: p4.reduce((sum, conference) => sum + (data.sport_mix[conference.conference][sport] || 0), 0), color: palette[sport] }));
    barChart(target, rows, { max: Math.max(...rows.map((row) => row.value), 1), valueFormat: money, left: 185, rowHeight: 34, label: '2026 modeled Power 4 market by sport' });
  }

  function pearson(rows) {
    if (rows.length < 2) return 0;
    const x = rows.map((row) => row.market_millions); const y = rows.map((row) => row.wins / (row.wins + row.losses)); const xMean = x.reduce((sum, value) => sum + value, 0) / x.length; const yMean = y.reduce((sum, value) => sum + value, 0) / y.length; const numerator = rows.reduce((sum, row, index) => sum + (x[index] - xMean) * (y[index] - yMean), 0); const denominator = Math.sqrt(x.reduce((sum, value) => sum + (value - xMean) ** 2, 0) * y.reduce((sum, value) => sum + (value - yMean) ** 2, 0));
    return denominator ? numerator / denominator : 0;
  }

  function successSummary(rows) {
    const valid = rows.filter((row) => Number.isFinite(row.market_millions) && row.wins + row.losses > 0); const correlation = pearson(valid); const descriptor = correlation >= .45 ? 'a clear positive' : correlation >= .2 ? 'a modest positive' : correlation >= 0 ? 'a weak positive' : 'a negative';
    return `Money and winning point in the same direction overall: this cross-year comparison shows ${descriptor} relationship (r = ${correlation.toFixed(2)}). But it is not destiny—the biggest modeled markets include both high-win teams and underperformers, and a 2026 market estimate cannot prove that money caused 2025 wins.`;
  }

  function render(data, history, footballSuccess) {
    const conferences = data.conferences; const byName = Object.fromEntries(conferences.map((row) => [row.conference, row])); const p4 = conferences.filter((row) => row.tier === 'Power 4');
    const all2024 = history.trend.find((row) => row.year === 2024 && row.group === 'All public disclosures'); const all2025 = history.trend.find((row) => row.year === 2025 && row.group === 'All public disclosures'); const segments = history.segments;
    setStat('market_total', bigMoney(data.market.total_millions)); setStat('conference_count', integer(data.market.conference_count)); setStat('program_count', integer(data.market.program_count)); setStat('disclosure_count', integer(all2025.disclosure_count)); setStat('p4_share', percent(data.market.p4_share)); setStat('sec_market', money(byName.SEC.market_millions)); setStat('big_ten_market', money(byName['Big Ten'].market_millions)); setStat('big12_market', money(byName['Big 12'].market_millions)); setStat('acc_market', money(byName.ACC.market_millions));
    setStat('sec_median', money(byName.SEC.median_program_millions)); setStat('big_ten_median', money(byName['Big Ten'].median_program_millions)); setStat('big12_median', money(byName['Big 12'].median_program_millions)); setStat('acc_median', money(byName.ACC.median_program_millions)); setStat('sec_edge', percent(100 * (byName.SEC.market_millions / byName['Big Ten'].market_millions - 1)));
    setStat('disclosure_avg_2024', dollars(all2024.average_disclosure_value)); setStat('disclosure_avg_2025', dollars(all2025.average_disclosure_value)); setStat('disclosure_avg_change', percent(100 * (all2025.average_disclosure_value / all2024.average_disclosure_value - 1))); setStat('disclosure_median_2024', dollars(all2024.median_disclosure_value)); setStat('disclosure_median_2025', dollars(all2025.median_disclosure_value)); setStat('disclosure_median_change', percent(100 * (all2025.median_disclosure_value / all2024.median_disclosure_value - 1))); setStat('earnings_avg_change', percent(100 * (all2025.average_total_athlete_earnings / all2024.average_total_athlete_earnings - 1))); setStat('earnings_median_change', percent(100 * (all2025.median_total_athlete_earnings / all2024.median_total_athlete_earnings - 1)));
    const p4Segment = segments.find((row) => row.group === 'Power 4'); setStat('p4_disclosure_share', percent(100 * p4Segment.disclosure_count / all2025.disclosure_count)); setStat('p4_disclosure_average', dollars(p4Segment.average_disclosure_value)); setStat('all_disclosure_average', dollars(all2025.average_disclosure_value)); setStat('p4_disclosure_median', dollars(p4Segment.median_disclosure_value));

    const marketHistory = history.market_history?.rows || []; const currentHistoryRow = marketHistory[marketHistory.length - 1]; const conferenceHistory = marketHistory.flatMap((historyRow) => p4.map((conference) => ({ year: historyRow.year, series: conference.conference, value: historyRow.year === currentHistoryRow?.year ? conference.market_millions : historyRow.total_millions * conference.market_share / 100 }))); const medianHistory = marketHistory.flatMap((historyRow) => p4.map((conference) => ({ year: historyRow.year, series: conference.conference, value: historyRow.year === currentHistoryRow?.year ? conference.median_program_millions : conference.median_program_millions * historyRow.total_millions / data.market.total_millions }))); const marketStart = marketHistory[0]?.total_millions || 0; const marketEnd = currentHistoryRow?.total_millions || 0; setStat('market_history_start', money(marketStart)); setStat('market_history_end', money(marketEnd)); setStat('market_history_change', percent(100 * (marketEnd / marketStart - 1)));
    multiYearLineChart(document.querySelector('#nationalMarketHistoryChart'), marketHistory.map((row) => ({ year: row.year, series: 'Total estimated market', value: row.total_millions })), { max: 4500, valueFormat: money, label: 'National estimated NIL market history', colors: [colors.blue], labelPoints: true });
    multiYearLineChart(document.querySelector('#conferenceHistoryChart'), conferenceHistory, { max: 900, valueFormat: money, label: 'Power 4 conference market history', colors: [colors.blue, colors.coral, colors.violet, colors.teal] });
    multiYearLineChart(document.querySelector('#medianHistoryChart'), medianHistory, { max: 50, valueFormat: money, label: 'Power 4 median program history', colors: [colors.blue, colors.coral, colors.violet, colors.teal] });
    barChart(document.querySelector('#conferenceChart'), p4.map((row) => ({ label: row.conference, value: row.market_millions, color: row.conference === 'SEC' ? colors.blue : colors.violet })), { max: 900, valueFormat: money, left: 170, rowHeight: 42, label: 'Power 4 modeled market by conference' });
    lollipopChart(document.querySelector('#fullRankingChart'), conferences.slice(0, 12).map((row) => ({ label: row.conference, value: row.market_millions, color: row.tier === 'Power 4' ? colors.blue : row.tier === 'Group of 5' ? colors.gold : colors.violet })), { max: 900, valueFormat: money, left: 165, rowHeight: 31 });
    barChart(document.querySelector('#medianChart'), p4.map((row) => ({ label: row.conference, value: row.median_program_millions, color: colors.coral })), { max: 50, valueFormat: money, left: 170, rowHeight: 42, label: 'Typical modeled program estimate by conference' });
    stackedBarChart(document.querySelector('#sportMixChart'), p4.map((row) => { const mix = data.sport_mix[row.conference]; const total = row.market_millions; return { label: row.conference, Football: 100 * mix.Football / total, "Men's basketball": 100 * mix["Men's basketball"] / total, "Women's basketball": 100 * mix["Women's basketball"] / total, Baseball: 100 * mix.Baseball / total, "Everything else": 100 * mix["Everything else"] / total }; }), ['Football', "Men's basketball", "Women's basketball", 'Baseball', 'Everything else'], { colors: { Football: colors.blue, "Men's basketball": colors.violet, "Women's basketball": colors.coral, Baseball: colors.gold, "Everything else": '#c9d0dc' } });
    barChart(document.querySelector('#leaderChart'), p4.map((row) => ({ label: `${row.conference} · ${row.leader}`, value: row.leader_millions, color: row.conference === 'SEC' ? colors.blue : row.conference === 'Big Ten' ? colors.coral : row.conference === 'ACC' ? colors.violet : colors.teal })), { max: 85, valueFormat: money, left: 220, rowHeight: 42, label: 'Largest modeled program estimate in each Power 4 conference' });
    const positions = data.fbs_position_context.groups; barChart(document.querySelector('#positionMarketChart'), positions.map((row) => ({ label: row.position, value: row.modeled_market_millions, color: row.position === 'Quarterback' ? colors.blue : row.position === 'Wide receiver' ? colors.coral : colors.violet })), { max: 650, valueFormat: money, left: 175, rowHeight: 30, label: 'Modeled FBS football position market' });
    splitMetricChart(document.querySelector('#disclosureTrendChart'), [all2024, all2025].map((row) => ({ label: row.year, dateRange: row.date_range, average: row.average_disclosure_value, median: row.median_disclosure_value })), { label: 'Average and median public disclosure by year' });
    splitMetricChart(document.querySelector('#earningsTrendChart'), [all2024, all2025].map((row) => ({ label: row.year, dateRange: row.date_range, average: row.average_total_athlete_earnings, median: row.median_total_athlete_earnings })), { label: 'Average and median athlete earnings by year' });
    renderSportMarketChart(document.querySelector('#sportDisclosureChart'), data, p4);
    const programMarket = Object.fromEntries(data.power4_programs.map((row) => [row.school, row])); const successRows = footballSuccess.rows.map((row) => { const program = programMarket[row.school]; return { ...row, market_millions: program ? program.market_millions : NaN }; }).filter((row) => Number.isFinite(row.market_millions)); const bySuccessConference = Object.fromEntries(['SEC', 'Big Ten', 'ACC', 'Big 12'].map((conference) => [conference, successRows.filter((row) => row.conference === conference)])); conferenceSuccessChart(document.querySelector('#secSuccessChart'), bySuccessConference.SEC, colors.blue); conferenceSuccessChart(document.querySelector('#bigTenSuccessChart'), bySuccessConference['Big Ten'], colors.coral); conferenceSuccessChart(document.querySelector('#accSuccessChart'), bySuccessConference.ACC, colors.violet); conferenceSuccessChart(document.querySelector('#big12SuccessChart'), bySuccessConference['Big 12'], colors.teal); setStat('money_win_summary', successSummary(successRows));
    renderSegmentChart(document.querySelector('#segmentChart'), segments);
  }

  const dataPromise = window.NIL_DATA ? Promise.resolve(window.NIL_DATA) : fetch('data/division1_market.json').then((response) => response.json());
  const historyPromise = window.NIL_HISTORY ? Promise.resolve(window.NIL_HISTORY) : fetch('data/nil_summary.json').then((response) => response.json()).then((raw) => ({ trend: [{ year: 2024, group: 'All public disclosures', date_range: raw.comparison_snapshot_2024.date_range, ...raw.comparison_snapshot_2024 }, { year: 2025, group: 'All public disclosures', date_range: raw.snapshot.date_range, disclosure_count: raw.overall.disclosure_count, average_disclosure_value: raw.overall.average_disclosure_value, median_disclosure_value: raw.overall.median_disclosure_value }], segments: raw.segments }));
  const footballPromise = fetch('data/football_success.json').then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); });
  Promise.all([dataPromise, historyPromise, footballPromise]).then(([data, history, footballSuccess]) => render(data, history, footballSuccess)).catch((error) => { document.querySelectorAll('.chart-wrap').forEach((node) => empty(node, `Could not load the report data: ${error.message}`)); });
})();
