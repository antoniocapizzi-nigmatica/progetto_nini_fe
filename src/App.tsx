import React from 'react';
import logo from './logo.svg';
import './App.css';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import {createStyles, makeStyles, Theme, withStyles} from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import {Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import NativeSelect from '@material-ui/core/NativeSelect';
import axios from 'axios';

function App() {
    interface dataFromServer {
        response:
            {
            subcategory: string,
            percentage: number,
            correlated_descriptions: string[]
            }[]
    }
    const StyledTableCell = withStyles((theme: Theme) =>
        createStyles({
            head: {
                backgroundColor: "grey",
                color: theme.palette.common.black,
            },
            body: {
                fontSize: 10,
            },
        }),
    )(TableCell);
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            formControl: {
                margin: theme.spacing(1),
                minWidth: 120,
                maxWidth: 300
            },
            selectEmpty: {
                marginTop: theme.spacing(2),
            },
            short: {
                maxWidth: 150
            },
            table: {
                width: 500,
                marginTop: theme.spacing(2),
                marginRight: theme.spacing(1),
            },
        }),
    );
    const classes = useStyles();
    const [state, setState] = React.useState<{ serverurl: string; algorithm: string; text: string; table: dataFromServer, descriptionsToShow: string[], selectedDescriptions: string[] }>({
        serverurl: '',
        algorithm: 'logreg',
        text: '',
        table: {response: [{subcategory:'', percentage: 0, correlated_descriptions: []}]},
        descriptionsToShow: [''],
        selectedDescriptions: ['']
    });

    const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        const name = event.target.name as keyof typeof state;
        setState({
            ...state,
            [name]: event.target.value,
        });
    };

    const submit = () => {
        let request = {algorithm: state.algorithm, text: state.text};
        console.log(state.algorithm);
        axios.post<dataFromServer>(state.serverurl, request)
            .then(response => {
                setState({ ...state, table: response.data });
                console.log(response.data);
            });
    };
    const setDescriptionToShow = (descr: string[]) => {
            setState({ ...state, descriptionsToShow: descr });
    };
    const addSelectedDescription = (descr: string) => {
        let sel = state.selectedDescriptions;
        sel.push(descr);
        setState({ ...state, selectedDescriptions: sel });
    };
    return (
        <div className="App">
            <Grid item xs={12} direction="column">
                <form>
                    <Grid container direction="column" justify="center" alignItems="stretch">
                        <TextField
                            id="outlined-multiline-static"
                            label="Insert the text here"
                            multiline
                            value={state.text}
                            onChange={handleChange}
                            name="text"
                            rows={4}
                            variant="outlined"
                        />
                        <TextField id="standard-basic"
                                   label="Insert the server url here"
                                   value={state.serverurl}
                                   onChange={handleChange}
                                   name="serverurl"
                                   className={classes.formControl}
                        />
                        <FormControl className={classes.formControl}>
                            <NativeSelect
                                value={state.algorithm}
                                onChange={handleChange}
                                name="algorithm"
                                className={classes.selectEmpty}
                                inputProps={{'aria-label': 'algorithm'}}
                            >
                                <option value={"logreg"}>Logistic Regression</option>
                                <option value={"svm"}>SVM</option>
                                <option value={"randfor"}>Random Forest</option>
                            </NativeSelect>
                            <FormHelperText>Select the algorithm</FormHelperText>
                        </FormControl>
                        <Button className={classes.short} variant="contained" onClick={submit}>Submit</Button>

                        <Grid container direction="row" justify="flex-start" alignItems="flex-start">
                            <TableContainer className={classes.table}>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>Recommended Areas</StyledTableCell>
                                            <StyledTableCell>%</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {state.table.response.map(row => (
                                            <TableRow>
                                                <TableCell onClick={() =>setDescriptionToShow(row.correlated_descriptions)}>{row.subcategory}</TableCell>
                                                <TableCell>{row.percentage}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TableContainer className={classes.table}>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>Descriptions</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {state.descriptionsToShow.map(row => (
                                            <TableRow>
                                                <TableCell onClick={() => addSelectedDescription(row)}>{row}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TableContainer className={classes.table}>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>Selected Descriptions</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {state.selectedDescriptions.map(row => (
                                            <TableRow>
                                                <TableCell>{row}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                    </Grid>
                </form>
            </Grid>
        </div>
    );
}

export default App;
