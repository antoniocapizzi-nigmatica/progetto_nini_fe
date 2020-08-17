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
import {DragDropContext, Droppable, Draggable, DropResult, DraggableLocation} from "react-beautiful-dnd";

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
                maxWidth: 150,
                marginRight: 10
            },

            table: {
                width: 500,
                marginTop: theme.spacing(2),
                marginRight: theme.spacing(1),
            },
            padd: {
                padding: 10
            }
        }),
    );
    const classes = useStyles();
    const [state, setState] = React.useState<{ serverurl: string; algorithm: string; text: string; table: dataFromServer, descriptionsToShow: string[], selectedDescriptions: string[] }>({
        serverurl: '',
        algorithm: 'randfor',
        text: '',
        table: {response: [{subcategory:'', percentage: 0, correlated_descriptions: []}]},
        descriptionsToShow: [],
        selectedDescriptions: []
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
    const grid:number = 8;
    const getItemStyle = (isDragging: boolean, draggableStyle: any):{} => ({
        userSelect: 'none',
        padding: 2*grid,
        margin: `0 0 ${grid}px 0`,
        background: isDragging ? 'lightgreen' : 'grey',
        ...draggableStyle
    });

    const getListStyle = (isDraggingOver: boolean):{} => ({
        background: isDraggingOver ? 'lightblue' : 'lightgrey',
        padding: grid,
        width: 300,
        minHeight: 400,
        marginRight: 10
    });
    const reorder = (list: string[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };
    const move = (source: string[], destination:string[], droppableSource: DraggableLocation, droppableDestination: DraggableLocation) => {
        const sourceClone = Array.from(source);
        const destClone = Array.from(destination);
        const [removed] = sourceClone.splice(droppableSource.index, 1);

        destClone.splice(droppableDestination.index, 0, removed);

        const result = {droppable: sourceClone, droppable2: destClone};

        return result;
    };
    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                state.descriptionsToShow,
                source.index,
                destination.index
            );


            if (source.droppableId === 'droppable2') {
                setState({...state, descriptionsToShow: items})
            }


        } else {
            const result = move(
                state.descriptionsToShow,
                state.selectedDescriptions,
                source,
                destination
            );

            setState({...state, descriptionsToShow: result.droppable, selectedDescriptions: result.droppable2})
        }

    };
    return (
        <div className="App">
            <Grid item xs={12} direction="column">
                <form>
                    <Grid container direction="column" justify="center" alignItems="stretch">
                        <TextField
                            id="outlined-multiline-static"
                            label="Add a project or a lesson as text"
                            multiline
                            value={state.text}
                            onChange={handleChange}
                            name="text"
                            rows={4}
                            variant="outlined"
                        />
                        <Grid container direction="row">
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
                                    <option value={"randfor"}>Random Forest (Recommended)</option>
                                    <option value={"logreg"}>Logistic Regression</option>
                                    <option value={"svm"}>SVM</option>

                                </NativeSelect>
                                <FormHelperText>Select the algorithm</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid container direction="row" justify="center" alignItems="center">
                            <Button className={classes.short} variant="contained" color="primary" onClick={submit}>Submit</Button>
                            <Button className={classes.short} variant="contained">Reset</Button>
                        </Grid>


                        <Grid container direction="row" justify="flex-start" alignItems="flex-start">
                            <TableContainer className={classes.table}>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>Recommended Areas</StyledTableCell>
                                            <StyledTableCell>Probabilities</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {state.table.response.map(row => (
                                            <TableRow>
                                                <TableCell onClick={() =>setDescriptionToShow(row.correlated_descriptions)}>{row.subcategory}</TableCell>
                                                <TableCell>{row.percentage+" %"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Grid item direction="column">
                                <Grid container direction="row" justify="space-around" alignItems="center">
                                    <h4>Related Competencies</h4>
                                    <h4>Selected Competencies</h4>
                                </Grid>
                                <Grid container direction="row" justify="space-around" alignItems="center">
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="droppable">
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    style={getListStyle(snapshot.isDraggingOver)}>
                                                    {state.descriptionsToShow.map((item, index) => (
                                                        <Draggable
                                                            key={item}
                                                            draggableId={item}
                                                            index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    style={getItemStyle(
                                                                        snapshot.isDragging,
                                                                        provided.draggableProps.style
                                                                    )}>
                                                                    {item}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                        <Droppable droppableId="droppable2">
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    style={getListStyle(snapshot.isDraggingOver)}>
                                                    {state.selectedDescriptions.map((item, index) => (
                                                        <Draggable
                                                            key={item}
                                                            draggableId={item}
                                                            index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    style={getItemStyle(
                                                                        snapshot.isDragging,
                                                                        provided.draggableProps.style
                                                                    )}>
                                                                    {item}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </Grid>

                            </Grid>

                            {/* <TableContainer className={classes.table}>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>Related Competencies</StyledTableCell>
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
                                            <StyledTableCell>Selected Competencies</StyledTableCell>
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
                            </TableContainer> */}
                        </Grid>

                    </Grid>
                </form>
            </Grid>
        </div>
    );
}

export default App;
