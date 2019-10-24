import React, {Component} from 'react';
import {
    CircularProgress,
    createStyles,
    Divider,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    withStyles,
    WithStyles
} from "@material-ui/core";
import quotes from './quotes';
import {Hook, QuoteValue} from "./libs/Quotes";
import {red} from "@material-ui/core/colors";
import {List, AutoSizer} from "react-virtualized";

const style = createStyles({

});

interface Props extends WithStyles<typeof style> {
    select: number;
    changeItem: any;
}

class QuotesList extends Component<Props> {

    _rowRender = ({style, key, index}: any) => {

        const quote = quotes[index];

        return (
            <div style={style} key={key}>
                <React.Fragment key={quote.id}>
                    <ListItem component={'div'} ContainerComponent={'div'} button selected={index === this.props.select} onClick={this.props.changeItem.bind(null, index)}>
                        <ListItemText
                            primary={quote.shortCode}
                            secondary={quote.title}
                        />
                        <ListItemSecondaryAction>
                            <Hook quotes={[quote.id]}>
                                {
                                    (values: any) => {
                                        const lp = values[quote.id];
                                        if (!lp) {
                                            return (
                                                <CircularProgress size={16}/>
                                            )
                                        }
                                        return (
                                            <QuoteValue value={lp}>
                                                <ListItemText
                                                    primary={lp}
                                                />
                                            </QuoteValue>
                                        );
                                    }
                                }
                            </Hook>
                        </ListItemSecondaryAction>
                    </ListItem>
                    {
                        ((index + 1) !== quotes.length) &&
                        <Divider/>
                    }
                </React.Fragment>
            </div>
        )
    };

    render () {
        const {classes} = this.props;

        return (
            <AutoSizer>
                {
                    ({width, height}) => {
                        return (
                            <List
                                rowCount={quotes.length}
                                rowHeight={73}
                                width={width}
                                height={height}
                                rowRenderer={this._rowRender}
                                overscanRowCount={0}
                                overscanColumnCount={0}
                                random={Math.random()}
                            />
                        )
                    }
                }
            </AutoSizer>
        )

        /*return (
            <List>
                {
                    quotes.map((quote, index) => {
                        return (
                            <React.Fragment key={quote.id}>
                                <ListItem button selected={index === this.props.select} onClick={this.props.changeItem.bind(null, index)}>
                                    <ListItemText
                                        primary={quote.shortCode}
                                        secondary={quote.title}
                                    />
                                    <ListItemSecondaryAction>
                                        <Hook quotes={[quote.id]}>
                                            {
                                                (values: any) => {
                                                    const lp = values[quote.id];
                                                    if (!lp) {
                                                        return (
                                                            <CircularProgress size={16}/>
                                                        )
                                                    }
                                                    return (
                                                        <QuoteValue value={lp}>
                                                            <ListItemText
                                                                primary={lp}
                                                            />
                                                        </QuoteValue>
                                                    );
                                                }
                                            }
                                        </Hook>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {
                                    ((index + 1) !== quotes.length) &&
                                    <Divider/>
                                }
                            </React.Fragment>
                        )
                    })
                }
            </List>
        );*/
    }
}

export default withStyles(style)(QuotesList);