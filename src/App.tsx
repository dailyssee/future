import React, {Component} from 'react';
import {createStyles, CssBaseline, Theme, Typography, WithStyles, withStyles} from '@material-ui/core';
import QuotesList from "./QuotesList";
import Chart from './Chart';

const style = (theme: Theme) => createStyles({
    box: {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        right: 0,
        margin: '0 auto',
        minHeight: 550,
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        top: 0
    },
    chart: {
        flex: 1,
        position: 'relative'
    },
    quotes: {
        height: 215,
        overflowY: 'auto',
        [theme.breakpoints.up('md')]: {
            height: 300
        }
    },
    title: {
        textAlign: 'center',
        fontSize: 22
    }
});

interface Props extends WithStyles<typeof style> {}

class App extends Component<Props> {

    state = {
        select: 0
    };

    handleChange = (select: number) => {
        this.setState({
            select
        })
    };

    render () {

        const {classes} = this.props;

        return (
            <>
                <CssBaseline/>
                <div className={classes.box}>
                    <Typography className={classes.title}>Future</Typography>

                    <Chart
                        select={this.state.select}
                    />

                    <div className={classes.quotes}>
                        <QuotesList select={this.state.select} changeItem={this.handleChange}/>
                    </div>
                </div>
            </>
        )
    }
}

export default withStyles(style)(App);