import sys, os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
csv_path = sys.argv[1]
png_path = sys.argv[2]
svg_path = sys.argv[3]
months, values = [], []
with open(csv_path, 'r') as f:
    next(f)
    for line in f:
        m, v = line.strip().split(',')
        months.append(m)
        values.append(int(v))
assert len(months) == 6, 'Expected 6 data points'
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(months, values, marker='o', color='#1f77b4', linewidth=2, label='Growth Trend')
ax.set_title('Monthly Performance Trend (2026)')
ax.set_xlabel('Month')
ax.set_ylabel('Active Projects')
ax.grid(True, linestyle='--', alpha=0.6)
ax.legend()
plt.tight_layout()
plt.savefig(png_path, dpi=150)
plt.savefig(svg_path)
plt.close('all')
print(f'RENDERED: {png_path} ({os.path.getsize(png_path)} bytes)')
print(f'RENDERED: {svg_path} ({os.path.getsize(svg_path)} bytes)')