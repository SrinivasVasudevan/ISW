import { useMemo, useState, useEffect } from 'react';
import './index.css';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getSortedRowModel
} from '@tanstack/react-table';

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
    columnHelper.accessor('average', {
        header: 'Average',
        cell: info => info.getValue(),
        filterFn: 'inNumberRange',
    }),
    columnHelper.accessor('min', {
        header: 'Minimum',
        cell: info => info.getValue(),
        filterFn: 'inNumberRange',
    }),
    columnHelper.accessor('max', {
        header: 'Maximum',
        cell: info => info.getValue(),
        filterFn: 'inNumberRange',
    }),
    columnHelper.accessor('count', {
        header: 'Count',
        cell: info => info.getValue(),
        filterFn: 'inNumberRange',
    }),
];

export default function Analytics({ pageNum, liveMode }) {
    const [data, setData] = useState();
    useEffect(() => {
        const url = liveMode
            ? `http://127.0.0.1:5000/api/analytics?page=${pageNum}&per_page=10&live_mode=true`
            : `http://127.0.0.1:5000/api/analytics?live_mode=false`;

        fetch(url)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                setData(result);
            })
            .catch(error => console.error('Error:', error));
    }, [pageNum, liveMode])
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
            id: 'average', value: ['', ''], filterFn: 'inNumberRange', type: 'number'
        },
        {
            id: 'min', value: ['', ''], filterFn: 'inNumberRange', type: 'number'
        },
        {
            id: 'max', value: ['', ''], filterFn: 'inNumberRange', type: 'number'
        },
        {
            id: 'count', value: ['', ''], filterFn: 'inNumberRange', type: 'number'
        },
    ]);

    const activeFilters = useMemo(() => filters.filter(filter => {
        if (filter.type === 'number' && Array.isArray(filter.value)) {
            return filter.value[0] !== '' || filter.value[1] !== '';
        }
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
        console.log(value, columnId)
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
        console.log(newFilter)
        setFilters(newFilter)
    };
    if (!data) {
        return <p>Loading...</p>
    }
    return (
        <div className="container">
            <div className="filters" >
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
                    <label>Average Range:</label>
                    <input
                        type="number"
                        value={filters[3].value[0]}
                        onChange={e => handleFilterChange('average', e.target.value, true, 'min')}
                        placeholder="Min Value"
                    />
                    <input
                        type="number"
                        value={filters[3].value[1]}
                        onChange={e => handleFilterChange('average', e.target.value, true, 'max')}
                        placeholder="Max Value"
                    />
                    <button onClick={() => { handleFilterChange('average', '', true, 'min'); handleFilterChange('average', '', true, 'max') }} >
                        Clear Average Filter
                    </button>
                </div>
                <div className="filter-group">
                    <label>Minimum Range:</label>
                    <input
                        type="number"
                        value={filters[4].value[0]}
                        onChange={e => handleFilterChange('min', e.target.value, true, 'min')}
                        placeholder="Min Value"
                    />
                    <input
                        type="number"
                        value={filters[4].value[1]}
                        onChange={e => handleFilterChange('min', e.target.value, true, 'max')}
                        placeholder="Max Value"
                    />
                    <button onClick={() => { handleFilterChange('min', '', true, 'min'); handleFilterChange('min', '', true, 'max') }} >
                        Clear Minimum Filter
                    </button>
                </div>
                <div className="filter-group">
                    <label>Maximum Range:</label>
                    <input
                        type="number"
                        value={filters[5].value[0]}
                        onChange={e => handleFilterChange('max', e.target.value, true, 'min')}
                        placeholder="Min Value"
                    />
                    <input
                        type="number"
                        value={filters[5].value[1]}
                        onChange={e => handleFilterChange('max', e.target.value, true, 'max')}
                        placeholder="Max Value"
                    />
                    <button onClick={() => { handleFilterChange('max', '', true, 'min'); handleFilterChange('max', '', true, 'max') }} >
                        Clear Maximum Filter
                    </button>
                </div>
                <div className="filter-group">
                    <label>Count Range:</label>
                    <input
                        type="number"
                        value={filters[6].value[0]}
                        onChange={e => handleFilterChange('count', e.target.value, true, 'min')}
                        placeholder="Min Value"
                    />
                    <input
                        type="number"
                        value={filters[6].value[1]}
                        onChange={e => handleFilterChange('count', e.target.value, true, 'max')}
                        placeholder="Max Value"
                    />
                    <button onClick={() => { handleFilterChange('count', '', true, 'min'); handleFilterChange('count', '', true, 'max') }} >
                        Clear Count Filter
                    </button>
                </div>
            </div>
            <div className='table-container'

                style={{
                    overflow: 'auto',
                    position: 'relative',
                    height: '600px',
                }}>
                <table className="data-table" >
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
                    <tbody>
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
        </div >
    );
}