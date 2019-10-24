import React, {Component} from 'react';
import {withSocketIO, WithSocketIOProps} from "./withSocketIO";
import {green, red} from "@material-ui/core/colors";

export const QuotesContext = React.createContext({
    add: (quotes: Array<any>, component: any) => {},
    delete: (quotes: Array<any>) => {},
    _attach: (component: any) => {},
    _detach: (component: any) => {},
    QuotesValues: {} as any
});

interface Props extends WithSocketIOProps {
    children: any;
}

interface QuotesGetterNativeProps extends QuotesGetterProps {
    add: any;
    delete: any;
    quotes: Array<number>;
    QuotesValues: any;
    _attach: any;
    _detach: any;
}

class QuotesGetterNative extends Component<QuotesGetterNativeProps> {

    quotes = [] as Array<number>;
    quotesMas = {} as any;

    data = {} as any;

    mounted = false;

    constructor (props: QuotesGetterNativeProps) {
        super(props);

        this.quotes = [...this.props.quotes];
        this.quotes.forEach(quote => {
            this.quotesMas[quote] = true;
        });

        this.props.add(this.quotes, this);
        this.props._attach(this);
    }

    componentDidMount(): void {
        this.mounted = true;
    }

    componentWillUnmount(): void {
        this.mounted = false;
        this.props._detach(this);
        this.props.delete(this.quotes);
    }

    componentWillReceiveProps(nextProps: Readonly<QuotesGetterNativeProps>, nextContext: any): void {
        const moves = this._newQuotes(nextProps.quotes, this.quotes);

        this.quotes = [...nextProps.quotes];
        this.quotes.forEach(quote => {
            this.quotesMas[quote] = true;
        });

        if (moves.needAdd.length>0) {
            this.props.add(moves.needAdd, this);
        }

        if (moves.needDelete.length>0) {
            moves.needDelete.forEach(el => {
                delete this.data[el];
            });
            this.props.delete(moves.needDelete);
        }
    }

    _update = (values: any) => {
        this.data = Object.assign(this.data, {
            [values.quote]: values.value
        });
        if (this.mounted) {
            this.forceUpdate();
        }
    };


    _newQuotes = (oldQuotes: Array<number>, newQuotes: Array<number>) => {

        const oldQuotesMas = {} as any;

        oldQuotes.forEach(el => oldQuotesMas[el] = true);

        let needDelete = [] as Array<number>;
        let needAdd    = [] as Array<number>;

        newQuotes.forEach(el => {
            if (!oldQuotesMas[el]) {
                needDelete.push(el);
            } else {
                delete oldQuotesMas[el];
            }
        });

        for (let key in oldQuotesMas) {
            if (oldQuotesMas.hasOwnProperty(key)) {
                needAdd.push(+key);
            }
        }

        return {needDelete, needAdd};
    };

    render () {

        const mas:any = {};

        this.quotes.forEach(quote => {
            if (this.data[quote]) {
                mas[quote] = this.data[quote];
            } else if (this.props.initValues && this.props.initValues[quote]) {
                mas[quote] = this.props.initValues[quote];
            }
        });

        return this.props.children(mas);
    }
}

interface QuotesGetterProps {
    quotes: Array<number>;
    static?: boolean;
    initValues?: any;
    children: (values: any) => any;
}

class QuotesGetter extends Component<QuotesGetterProps> {
    render () {
        return (
            <QuotesContext.Consumer>
                {
                    (props) => {
                        return <QuotesGetterNative {...props} {...this.props}/>;
                    }
                }
            </QuotesContext.Consumer>
        )
    }
}

class QuotesNative extends Component<Props> {

    localQuotes: any;
    QuotesValues: any;
    components: Array<any>;
    interval: any;

    bind = false;

    constructor (props: Props) {
        super(props);

        this.localQuotes = {};
        this.QuotesValues = {};
        this.components = [];

        this.interval = setInterval(() => {
            for (let quote in this.localQuotes) {
                if (this.localQuotes.hasOwnProperty(quote)) {
                    const value = this.localQuotes[quote];

                    if (value.count < 1 && Date.now() > (value.remove + 5000)) {
                        delete this.localQuotes[quote];
                        delete this.QuotesValues[quote];
                        this._emit('delete_quote', +quote);
                    }
                }
            }
        }, 1000);
    }

    componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
        if (nextProps.socket && !this.props.socket) {
            this._touchEvents(nextProps);
        }
    }

    _touchEvents = (props: Props) => {
        if (props.socket && !this.bind) {
            this.bind = true;
            props.socket.on('connect', () => {
                for (let quote in this.localQuotes) {
                    if (this.localQuotes.hasOwnProperty(quote)) {
                        this._emit('add_quote', +quote);
                    }
                }
            });

            props.socket.on('quote', (data: any) => {
                const {id, value} = data;
                if (this.localQuotes[id]) {
                    this.QuotesValues[id] = value;
                    this.components.forEach(component => {
                        if (component.quotesMas[id]) {
                            component._update({
                                quote: id,
                                value
                            });
                        }
                    });
                }
            });
        }
    };

    componentDidMount(): void {
        this._touchEvents(this.props);
    }

    componentWillUnmount(): void {
        clearInterval(this.interval);
    }

    _emit = (type: string, data: any) => {
        if (this.props.socket && this.props.socket.connected) {
            this.props.socket.emit(type, data);
        }
    };

    _add = (quotes: Array<number>, component: any) => {
        quotes.forEach(quote => {
            if (!this.localQuotes[quote]) {
                this.localQuotes[quote] = {
                    count: 1
                };
                this._emit('add_quote', quote);
            } else {
                this.localQuotes[quote].count += 1;
                delete this.localQuotes[quote].remove;
                if (this.QuotesValues[quote]) {
                    component._update({
                        quote,
                        value: this.QuotesValues[quote]
                    });
                }
            }
        });
    };

    _delete = (quotes: Array<number>) => {
        quotes.forEach(quote => {
            if (this.localQuotes[quote].count > 1) {
                this.localQuotes[quote].count -= 1;
            } else if (this.localQuotes[quote].count === 1) {
                this.localQuotes[quote].count = 0;
                this.localQuotes[quote].remove = Date.now();
            }
        });
    };

    _attach = (component: any) => {
        this.components.push(component);
    };

    _detach = (component: any) => {
        const index = this.components.findIndex(el => el===component);
        if (index !== -1) {
            this.components.splice(index, 1);
        }
    };

    render () {
        return (
            <QuotesContext.Provider
                value={{
                    add: this._add,
                    delete: this._delete,
                    QuotesValues: {},
                    _attach: this._attach,
                    _detach: this._detach
                }}
            >
                {this.props.children}
            </QuotesContext.Provider>
        );
    }
}

export const Hook = (props: {
    close?: boolean,
    closePrice?: number
} & QuotesGetterProps) => {
    if (props.children && typeof props.children === 'function') {
        if (props.close === true) {
            return props.children({
                [props.quotes[0]]: props.closePrice
            });
        } else {
            return <QuotesGetter {...props}/>
        }
    }
    return null;
};

class QuoteValue extends Component<{
    value: number;
    className?: string;
    style?: any;
    icon?: any;
    iconStyle?: any;
}> {

    state = {
        color: '#000'
    };

    immediate: any = 0;

    componentWillUnmount(): void {
        clearTimeout(this.immediate);
    }

    componentWillReceiveProps(nextProps: Readonly<{ value: number; className?: string; style?: any }>, nextContext: any): void {
        if (nextProps.value > this.props.value) {
            this.setState({
                color: green[500]
            });
        } else if (nextProps.value < this.props.value) {
            this.setState({
                color: red[500]
            });
        }
    }

    render () {

        const style: any = {
            color: this.state.color
        };

        if (this.state.color !== '#000') {
            clearTimeout(this.immediate);
            this.immediate = setTimeout(() => {
                this.setState({
                    color: '#000'
                });
            }, 1000);
        } else {
            style.transition = 'color 5s';
        }

        return React.Children.map(this.props.children, (child => React.cloneElement(child as any, {
            style
        })));
    }
}

export const Quotes = withSocketIO(QuotesNative);
export {QuotesGetter};
export {QuoteValue};