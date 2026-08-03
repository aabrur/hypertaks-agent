import sys, os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
months=[]; values=[]
with open(sys.argv[1],'r') as f:
  next(f)
  for line in f:
    m,v=line.strip().split(',')
    months.append(m); values.append(int(v))
fig,ax=plt.subplots()
ax.plot(months,values,marker='o')
ax.set_ylabel('Revenue (USD)')
ax.set_title('Monthly Revenue')
ax.grid(True)
os.makedirs(os.path.dirname(sys.argv[2]),exist_ok=True)
plt.savefig(sys.argv[2])
print('rendered', sys.argv[2])