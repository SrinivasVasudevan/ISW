import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getSortedRowModel
} from '@tanstack/react-table';
import { io } from 'socket.io-client'

const defaultData = [
    {
        fridge_id: 1,
        instrument_name: "instrument_one",
        parameter_name: "flux_bias",
        applied_value: 0.37,
        timestamp: 1739596596
    },
    {
        fridge_id: 2,
        instrument_name: "instrument_two",
        parameter_name: "temperature",
        applied_value: -0.12,
        timestamp: 1739597890
    },
    {
        fridge_id: 3,
        instrument_name: "instrument_three",
        parameter_name: "power_level",
        applied_value: 1.25,
        timestamp: 1739601234
    },
    {
        fridge_id: 1,
        instrument_name: "instrument_four",
        parameter_name: "current_bias",
        applied_value: 0.89,
        timestamp: 1739612345
    },
    {
        fridge_id: 2,
        instrument_name: "instrument_five",
        parameter_name: "voltage",
        applied_value: 0.02,
        timestamp: 1739623456
    }
];

const columnHelper = createColumnHelper();

const columns = [
    columnHelper.accessor('fridge_id', {
        header: 'Fridge ID',
        cell: info => info.getValue(),
        filterFn: 'equals',
    }),
    columnHelper.accessor('instrument_name', {
        header: 'Instrument',
        cell: info => info.getValue(),
        filterFn: 'includesString',
        enableSorting: false
    }),
    columnHelper.accessor('parameter_name', {
        header: 'Parameter',
        cell: info => info.getValue(),
        filterFn: 'includesString',
    }),
    columnHelper.accessor('applied_value', {
        header: 'Value',
        cell: info => info.getValue(),
        filterFn: 'inNumberRange',
    }),
    columnHelper.accessor('timestamp', {
        header: 'Timestamp',
        cell: info => new Date(info.getValue() * 1000).toLocaleString(),
        filterFn: 'inNumberRange',
    }),
];

export default function Table({ pageNum, liveMode, totalPages, setTotalPages, setLiveMode }) {
    const [data, setData] = useState([...defaultData]);
    const tableContainerRef = useRef(null)

    useEffect(() => {
        const url = liveMode
            ? `http://127.0.0.1:5001/api/settings?page=${pageNum}&per_page=10&live_mode=true`
            : `http://127.0.0.1:5001/api/settings?live_mode=false`;


        fetch(url)
            .then(response => response.json())
            .then(result => {
                setData(result.data);
                if (liveMode) setTotalPages(result.total)
            })
            .catch(error => console.error('Error:', error));

        if (liveMode) {

        }
    }, [pageNum, liveMode, setTotalPages])

    useEffect(() => {
        if (liveMode) {
            const newSocket = io('http://127.0.0.1:5001');

            newSocket.on('live_data', (newData) => {
                setData(prevData => {

                    if (pageNum === totalPages && prevData?.length <= 9) { return [...prevData, newData] }
                    else
                        return prevData
                });
                setTotalPages(prevPageCount => { if (prevPageCount !== newData.total) return newData.total; else return prevPageCount; })
            });

            return () => newSocket.disconnect();
        }
    }, [liveMode, pageNum, totalPages, setTotalPages]);

    const [sorting, setSorting] = useState([]);
    const [filters, setFilters] = useState([
        {
            id: 'fridge_id', value: '', filterFn: 'equals', type: 'number'
        },
        {
            id: 'instrument_name', value: '', filterFn: 'includesString', type: 'string'
        },
        {
            id: 'parameter_name', value: '', filterFn: 'includesString', type: 'string'
        },
        {
            id: 'applied_value', value: ['', ''], filterFn: 'inNumberRange', type: 'number'
        },
        {
            id: 'timestamp', value: ['', ''], filterFn: 'inNumberRange', type: 'number'
        },
    ]);

    const activeFilters = useMemo(() => filters.filter(filter => {
        if (filter.type === 'number' && Array.isArray(filter.value)) {
            // For range filters, only include if at least one value is non-empty
            return filter.value[0] !== '' || filter.value[1] !== '';
        }
        // For single value filters, only include if value is non-empty
        return filter.value !== '';
    }), [filters]);

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters: activeFilters,
            sorting
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting

    });

    const handleFilterChange = (columnId, value, isRange = false, rangeType = '') => {
        const newFilter = filters.map(filter => {
            const newValue = filter.type === 'number' && value !== '' ? Number(value) : value
            if (filter.id === columnId && !isRange) {
                return {
                    ...filter,
                    value: newValue
                }
            } else if (filter.id === columnId && isRange) {

                return {
                    ...filter,
                    value: rangeType === 'min' ? [newValue, filter.value[1]] : [filter.value[0], newValue]
                }
            } else {
                return filter
            }
        })
        setFilters(newFilter)
    };

    const fetchMoreOnBottomReached = useCallback(
        (containerRefElement) => {
            if (containerRefElement && !liveMode) {
                const { scrollHeight, scrollTop, clientHeight } = containerRefElement
                if (scrollHeight - scrollTop - clientHeight <= 500) {
                    fetch(`http://127.0.0.1:5001/api/settings?live_mode=false`)
                        .then(response => response.json())
                        .then(result => {
                            setData(result.data);
                        })
                        .catch(error => console.error('Error:', error));
                }
            }
        },
        [liveMode]
    )

    return (
        <div className="container">
            <div style={{ padding: '50px', display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
                <button onClick={() => setLiveMode(prevMode => !prevMode)} >{liveMode ? 'Infinte Scrolling' : 'Switch to Live Mode'}</button>
            </div>
            <div className="filters">
                <div className="filter-group">
                    <label>Fridge ID:</label>
                    <input
                        type="text"
                        value={filters[0].value}
                        onChange={e => handleFilterChange('fridge_id', e.target.value)}
                        placeholder="Filter Fridge ID..."
                    />
                    <button onClick={() => { handleFilterChange('fridge_id', '') }} >
                        Clear Fridge Filter
                    </button>
                </div>
                <div className="filter-group">
                    <label>Instrument:</label>
                    <input
                        type="text"
                        value={filters[1].value}
                        onChange={e => handleFilterChange('instrument_name', e.target.value)}
                        placeholder="Filter Instrument..."
                    />
                    <button onClick={() => { handleFilterChange('instrument_name', '') }} >
                        Clear Instrument Filter
                    </button>
                </div>
                <div className="filter-group">
                    <label>Parameter:</label>
                    <input
                        type="text"
                        value={filters[2].value}
                        onChange={e => handleFilterChange('parameter_name', e.target.value)}
                        placeholder="Filter Parameter..."
                    />
                    <button onClick={() => { handleFilterChange('parameter_name', '') }} >
                        Clear Parameter Filter
                    </button>
                </div>
                <div className="filter-group">
                    <label>Value Range:</label>
                    <input
                        type="number"
                        value={filters[3].value[0]}
                        onChange={e => handleFilterChange('applied_value', e.target.value, true, 'min')}
                        placeholder="Min Value"
                    />
                    <input
                        type="number"
                        value={filters[3].value[1]}
                        onChange={e => handleFilterChange('applied_value', e.target.value, true, 'max')}
                        placeholder="Max Value"
                    />
                    <button onClick={() => { handleFilterChange('applied_value', '', true, 'min'); handleFilterChange('applied_value', '', true, 'max') }} >
                        Clear Value Filter
                    </button>
                </div>
                <div className="filter-group">
                    <label>Timestamp Range:</label>
                    <input
                        type="datetime-local"
                        value={filters[4].value[0] ? new Date(filters[4].value[0] * 1000).toISOString().slice(0, 16) : ''}
                        onChange={e => handleFilterChange('timestamp', new Date(e.target.value).getTime() * 0.001, true, 'min')}
                    />
                    <input
                        type="datetime-local"
                        value={filters[4].value[1] ? new Date(filters[4].value[1] * 1000).toISOString().slice(0, 16) : ''}
                        onChange={e => handleFilterChange('timestamp', new Date(e.target.value).getTime() * 0.001, true, 'max')}
                    />
                    <button onClick={() => { handleFilterChange('timestamp', '', true, 'min'); handleFilterChange('timestamp', '', true, 'max') }} >
                        Clear Timestamp Filter
                    </button>
                </div>
            </div>
            <div className='table-container'
                onScroll={e => fetchMoreOnBottomReached(e.currentTarget)}
                ref={tableContainerRef}
                style={{
                    overflow: 'auto',
                    position: 'relative',
                    height: '600px',
                }}>
                <table className="data-table">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className={header.column.getIsSorted() ? 'sorted' : ''}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        <span>
                                            {header.column.getIsSorted() === 'asc' ? ' 🔼' :
                                                header.column.getIsSorted() === 'desc' ? ' 🔽' : header.column.columnDef.enableSorting !== false ? ' ↕️' : ''}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className='tb'>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}