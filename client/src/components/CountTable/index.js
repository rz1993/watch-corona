import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Select from '@material-ui/core/Select';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';

import { getClient } from '../../api';
import { Paper } from '../shared';


const useStylesSearch = makeStyles(theme => ({
  textField: {
    //margin: theme.spacing(0),
    width: '25ch',
  }
}))

const SearchInput = ({ value, onChange }) => {
  const classes = useStylesSearch()

  return (
    <FormControl className={classes.textField}>
      <InputLabel htmlFor="standard-adornment-password">Search</InputLabel>
      <Input
        id="standard-adornment-password"
        type="text"
        value={value}
        onChange={onChange}
        endAdornment={
          <InputAdornment position="end">
            <IconButton aria-label="search locations">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  )
}

const SelectLevel = ({ value, onChange }) => {
  const classes = useStylesSearch();
  return (
    <FormControl className={classes.formControl}>
      <InputLabel htmlFor="age-native-simple">Level</InputLabel>
      <Select
        native
        value={value}
        onChange={onChange}
        inputProps={{
          name: 'age',
          id: 'age-native-simple',
        }}
      >
        <option value="country">Country</option>
        <option value="state">State</option>
        <option value="city">City</option>
      </Select>
    </FormControl>
  )
}


const HeaderCell = withStyles(theme => ({
  head: {
    color: theme.palette.common.blue,
    fontSize: 15,
    fontWeight: 600
  }
}))(TableCell);

const useStylesPagination = makeStyles(theme => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  }
}));

function TablePaginationActions(props) {
  const classes = useStylesPagination();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleFirstPageButtonClick = event => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = event => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = event => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = event => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  title: {
    flex: '1 1 20%',
    fontWeight: 600
  },
  form: {
    '& > *': {
      marginLeft: theme.spacing(1),
      width: '16ch',
    },
  }
}));

const CountTableHeader = ({
  level,
  onChangeLevel,
  search,
  onChangeSearch
}) => {
  const classes = useToolbarStyles()

  return (
    <Toolbar className={classes.root}>
      <Typography className={classes.title} variant="h6" id="tableTitle">
        Updated Totals
      </Typography>
      <form className={classes.form}>
        <SelectLevel value={level} onChange={onChangeLevel} />
        <SearchInput value={search} onChange={onChangeSearch} />
      </form>
    </Toolbar>
  )
}

const useStylesTable = makeStyles({
  table: {
    minWidth: 500,
  },
});

const levelNames = {
  country: { nameKey: 'country_region', nameTitle: 'Country (or Region)' },
  state: { nameKey: 'province_state', nameTitle: 'State (or Province)'},
  city: { nameKey: 'city', nameTitle: 'City (US)' }
}

export default function CountTable(props) {
  const classes = useStylesTable();
  const [level, setLevel] = useState('country');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState(null);
  const [allRows, setRows] = useState([]);

  useEffect(() => {
    getClient(level).newest({ sortBy: 'confirmed' })
      .then(resp => {
        setRows(resp.data)
      })
  }, [level])

  const {nameKey, nameTitle} = levelNames[level]

  let rows = allRows
  if (search) {
    rows = allRows.filter(row => row[nameKey].toLowerCase().startsWith(search))
  }

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleChangeLevel = event => {
    setLevel(event.target.value)
    setRows([])
    setPage(0)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeSearch = event => {
    setSearch(event.target.value.toLowerCase())
    setPage(0)
  }

  const { handleRowSelect } = props

  return (
    <Paper>
    <TableContainer>
      <CountTableHeader
        level={level}
        onChangeLevel={handleChangeLevel}
        search={search}
        onChangeSearch={handleChangeSearch} />
      <Table className={classes.table} aria-label="custom pagination table">
        <TableHead>
          <TableRow>
            <HeaderCell>{ nameTitle }</HeaderCell>
            <HeaderCell align="right">Confirmed</HeaderCell>
            <HeaderCell align="right">Deaths</HeaderCell>
            <HeaderCell align="right">Recovered</HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row, i) => (
            <TableRow
              hover
              key={`${nameKey}_${row[nameKey]}_${i}`}
              onClick={evt => handleRowSelect(level, row[nameKey])}>
              <TableCell component="th" scope="row">
                {row[nameKey]}
              </TableCell>
              <TableCell align="right">{row.confirmed}</TableCell>
              <TableCell align="right">{row.deaths}</TableCell>
              <TableCell align="right">{row.recovered}</TableCell>
            </TableRow>
          ))}

          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[10, 25, { label: 'All', value: -1 }]}
              colSpan={3}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true,
              }}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              style={{ borderBottom: 'none'}}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
    </Paper>
  );
}
