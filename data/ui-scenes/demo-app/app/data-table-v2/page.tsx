'use client'

import { useState, useMemo } from 'react'
import styles from './page.module.css'

interface Employee {
  id: number
  name: string
  department: string
  position: string
  salary: number
  joinDate: string
  status: 'active' | 'inactive'
}

const initialEmployees: Employee[] = [
  { id: 1, name: '张三', department: '技术部', position: '前端工程师', salary: 25000, joinDate: '2021-03-15', status: 'active' },
  { id: 2, name: '李四', department: '产品部', position: '产品经理', salary: 30000, joinDate: '2020-06-20', status: 'active' },
  { id: 3, name: '王五', department: '技术部', position: '后端工程师', salary: 28000, joinDate: '2022-01-10', status: 'active' },
  { id: 4, name: '赵六', department: '设计部', position: 'UI设计师', salary: 22000, joinDate: '2021-08-05', status: 'inactive' },
  { id: 5, name: '孙七', department: '市场部', position: '市场专员', salary: 18000, joinDate: '2023-02-28', status: 'active' },
  { id: 6, name: '周八', department: '技术部', position: '全栈工程师', salary: 35000, joinDate: '2019-11-12', status: 'active' },
  { id: 7, name: '吴九', department: '人事部', position: 'HR专员', salary: 15000, joinDate: '2022-07-01', status: 'active' },
  { id: 8, name: '郑十', department: '财务部', position: '财务主管', salary: 32000, joinDate: '2020-04-18', status: 'inactive' },
]

type SortKey = 'name' | 'department' | 'salary' | 'joinDate'
type SortOrder = 'asc' | 'desc'

export default function DataTableV2Page() {
  const [employees] = useState<Employee[]>(initialEmployees)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const departments = useMemo(() => {
    return Array.from(new Set(employees.map(e => e.department)))
  }, [employees])

  const filteredAndSortedEmployees = useMemo(() => {
    let result = [...employees]

    // 缺陷1: 搜索过滤只按部门搜索，而不是按姓名和职位
    if (searchTerm) {
      result = result.filter(e => 
        e.department.includes(searchTerm)
      )
    }

    // 部门过滤
    if (departmentFilter !== 'all') {
      result = result.filter(e => e.department === departmentFilter)
    }

    // 缺陷2: 状态过滤逻辑反了
    if (statusFilter !== 'all') {
      result = result.filter(e => e.status !== statusFilter)
    }

    // 缺陷3: 排序方向始终是降序，忽略 sortOrder
    result.sort((a, b) => {
      let comparison = 0
      if (sortKey === 'salary') {
        comparison = a.salary - b.salary
      } else if (sortKey === 'joinDate') {
        comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
      } else {
        comparison = a[sortKey].localeCompare(b[sortKey])
      }
      return -comparison // 始终降序
    })

    return result
  }, [employees, searchTerm, departmentFilter, statusFilter, sortKey, sortOrder])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  // 缺陷4: 总薪资计算使用了全部员工而非过滤后的
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0)
  // 缺陷5: 在职人数计算错误 - 计算的是离职人数
  const activeCount = filteredAndSortedEmployees.filter(e => e.status === 'inactive').length

  return (
    <main className={styles.main}>
      {/* 缺陷6: 标题emoji错误 */}
      <h1 className={styles.title}>📈 员工数据表 V2</h1>

      <div className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="搜索姓名或职位..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          className={styles.select}
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="all">所有部门</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {/* 缺陷7: 状态过滤的选项值和显示文本不匹配 */}
        <select 
          className={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">所有状态</option>
          <option value="inactive">在职</option>
          <option value="active">离职</option>
        </select>
      </div>

      <div className={styles.stats}>
        <span>共 {filteredAndSortedEmployees.length} 人</span>
        {/* 缺陷8: 显示文案与实际数据不匹配 */}
        <span>在职 {activeCount} 人</span>
        <span>总薪资 ¥{totalSalary.toLocaleString()}</span>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className={styles.sortable}>
                姓名 {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('department')} className={styles.sortable}>
                部门 {sortKey === 'department' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>职位</th>
              <th onClick={() => handleSort('salary')} className={styles.sortable}>
                薪资 {sortKey === 'salary' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('joinDate')} className={styles.sortable}>
                入职日期 {sortKey === 'joinDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedEmployees.map(employee => (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>{employee.department}</td>
                <td>{employee.position}</td>
                <td>¥{employee.salary.toLocaleString()}</td>
                <td>{employee.joinDate}</td>
                <td>
                  {/* 缺陷9: 状态显示反了 */}
                  <span className={`${styles.status} ${employee.status === 'active' ? styles.inactive : styles.active}`}>
                    {employee.status === 'active' ? '离职' : '在职'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedEmployees.length === 0 && (
        <div className={styles.emptyState}>没有找到匹配的员工</div>
      )}

      {/* 缺陷10: 返回首页链接缺失 */}
    </main>
  )
}
