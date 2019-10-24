import React, {Component} from 'react';
import {Button, CircularProgress, createStyles, Typography, withStyles, WithStyles} from "@material-ui/core";
import * as Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import quotes from './quotes';

Highcharts.setOptions({
    lang: {
        loading: 'Загрузка...',
        months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        shortMonths: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'],
        rangeSelectorFrom: "С",
        rangeSelectorTo: "По",
        rangeSelectorZoom: "Период",
        downloadPNG: 'Скачать PNG',
        downloadJPEG: 'Скачать JPEG',
        downloadPDF: 'Скачать PDF',
        downloadSVG: 'Скачать SVG',
        printChart: 'Напечатать график'
    }
});

const style = createStyles({
    chart: {
        flex: 1,
        position: 'relative'
    },
    chartContainer: {
        height: '100%',
        width: '100%',
        position: 'absolute'
    },
    button: {
        margin: 5
    },
    centerItems: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center'
    }
});

interface Props extends WithStyles<typeof style> {
    select: number;
}

interface State {
    series: Array<any>,
    loading: number,
    range: 'week' | 'month' | 'year'
}

class Chart extends Component<Props> {

    state = {
        series: [],
        loading: 1,
        range: 'week' as 'week' | 'month' | 'year'
    } as State;

    options: Highcharts.Options = {
        title: {
            text: '',
        },
        xAxis: {
            type: 'datetime',
            ordinal: true
        },
        yAxis: {
            title: {
                text: ''
            },
            opposite: false
        },
        legend: {
            enabled: false
        },
        //@ts-ignore
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        //@ts-ignore
                        [0, Highcharts.getOptions().colors[0]],
                        //@ts-ignore
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                //@ts-ignore
                threshold: null
            },
        }
    };

    mounted = false;
    abortController: AbortController | undefined;

    _update = (props: Props, state: State) => {

        if (this.abortController) {
            this.abortController.abort();
        }

        if (state.loading !== 1) {
            this.setState({
                loading: 1
            });
        }

        const quote = quotes[props.select];

        if (quote && quote.code) {

            this.abortController = new AbortController();

            fetch(`/historyData?symbol=${quote.code}&range=${state.range}&_t=${Date.now()}`, {
                signal: this.abortController.signal
            })
                .then(data => data.json())
                .then(data => {
                    if (data && data.response && this.mounted) {
                        this.setState({
                            loading: 3,
                            series: data.response
                        });
                    } else if (this.mounted) {
                        this.setState({
                            loading: 2
                        });
                    }
                })
                .catch(e => {
                    if (e.name !== 'AbortError' && this.mounted) {
                        this.setState({
                            loading: 2
                        });
                    }
                })
        }
    };

    componentDidMount(): void {
        this._update(this.props, this.state);
        this.mounted = true;
    }

    componentWillUnmount(): void {
        this.mounted = false;
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>, nextContext: any): boolean {
        if (nextProps.select !== this.props.select || nextState.range !== this.state.range) {
            this._update(nextProps, nextState);
        }
        return true;
    }

    buttonClick = (range: string) => {
        this.setState({
            range
        })
    };

    handleRepeat = () => {
        this._update(this.props, this.state);
    };

    render () {
        const {classes} = this.props;

        const options = Object.assign(this.options, {
            series: [{
                type: 'area',
                name: quotes[this.props.select] && quotes[this.props.select].title,
                data: this.state.series
            }]
        });

        return (
            <>
                <div className={classes.chart}>
                    {
                        this.state.loading === 3 &&
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={options}
                            containerProps={{
                                className: classes.chartContainer
                            }}
                            allowChartUpdate={false}
                        />
                    }
                    {
                        this.state.loading === 1 &&
                            <div className={classes.centerItems}>
                                <CircularProgress/>
                            </div>
                    }

                    {
                        this.state.loading === 2 &&
                        <div className={classes.centerItems}>
                            <Typography variant={'h6'} gutterBottom>Произошла ошибка загрузки</Typography>
                            <Button variant={'outlined'} size={'small'} onClick={this.handleRepeat}>Повторить попытку</Button>
                        </div>
                    }
                </div>
                <div>
                    <Button className={classes.button} onClick={this.buttonClick.bind(this, 'week')} variant={this.state.range === 'week' ? 'contained' : 'outlined'} color={'primary'} size={'small'}>7 дн</Button>
                    <Button className={classes.button} onClick={this.buttonClick.bind(this, 'month')} variant={this.state.range === 'month' ? 'contained' : 'outlined'} color={'primary'} size={'small'}>1 мес</Button>
                    <Button className={classes.button} onClick={this.buttonClick.bind(this, 'year')} variant={this.state.range === 'year' ? 'contained' : 'outlined'} color={'primary'} size={'small'}>1 год</Button>
                </div>
            </>
        )
    }
}

export default withStyles(style)(Chart);