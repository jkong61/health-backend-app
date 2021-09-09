export class LineChartDataset {
  constructor (label, data, color) {
    this.type = 'line'
    this.label = label || 'My Chart'
    this.fill = false
    this.lineTension = 0.1
    this.backgroundColor = color || '#fff'
    this.borderColor = color || 'rgba(75,192,192,1)'
    this.borderDash = []
    this.borderDashOffset = 0.0
    this.pointBorderWidth = 1
    this.pointHoverRadius = 5
    this.pointHoverBackgroundColor = color || 'rgba(75,192,192,1)'
    this.pointHoverBorderColor = 'rgba(220,220,220,1)'
    this.pointHoverBorderWidth = 2
    this.pointRadius = 3
    this.spanGaps = true
    this.pointHitRadius = 10
    this.data = data || []
  }
}

export class ChartData {
  constructor (labels, datasets) {
    this.labels = labels || []
    this.datasets = datasets || []
  }
}

export class ChartOptions {
  constructor (dark, title = undefined, xLabel = undefined, yLabel = undefined, maintainAspectRatio = true) {
    this.maintainAspectRatio = maintainAspectRatio
    this.responsive = true
    this.title = {
      display: !!title,
      text: title ?? 'Chart Title',
      fontColor: dark ? '#fff' : '#000'
    }
    this.legend = {
      labels: {
        fontColor: dark ? '#fff' : '#000'
      },
      align: 'end',
      position: 'bottom'
    }
    this.tooltips = {
      mode: 'index',
      intersect: false
    }
    this.hover = {
      mode: 'nearest',
      intersect: true
    }
    this.scales = {
      xAxes: [
        {
          ticks: {
            fontColor: dark ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.7)'
          },
          display: true,
          scaleLabel: {
            display: !!xLabel,
            labelString: xLabel ?? 'X-Label',
            fontColor: dark ? '#fff' : '#000'
          },
          gridLines: {
            display: false,
            borderDash: [2],
            borderDashOffset: [2],
            color: dark ? 'rgba(33, 37, 41, 0.3)' : 'rgba(181, 182, 183, 0.3)',
            zeroLineColor: dark ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 1)',
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2]
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            fontColor: dark ? 'rgba(255,255,255,.7)' : 'rgba(0, 0, 0, .7)',
            beginAtZero: true
          },
          display: true,
          scaleLabel: {
            display: !!yLabel,
            labelString: yLabel ?? 'Y-Label',
            fontColor: dark ? '#fff' : '#000'
          },
          gridLines: {
            borderDash: [3],
            borderDashOffset: [3],
            drawBorder: false,
            color: dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
            zeroLineColor: dark ? 'rgba(33, 37, 41, 0)' : 'rgba(181, 182, 183, 0)',
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2]
          }
        }
      ]
    }
  }
}

export class BarChartDataset {
  constructor (label, data, color) {
    this.type = 'bar'
    this.label = label || 'My Chart'
    this.backgroundColor = color || 'rgba(75,192,192,1)'
    this.borderWidth = 2
    this.data = data || []
  }
}
