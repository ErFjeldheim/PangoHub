'use client'

import { FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createDepartment, updateDepartment } from '@/app/actions/departments'

interface DepartmentFormProps {
  department?: {
    id: string
    name: string
    description: string
  }
  onSuccess: () => void
}

const DepartmentForm: FC<DepartmentFormProps> = ({ department, onSuccess }) => {
  const [name, setName] = useState(department?.name || '')
  const [description, setDescription] = useState(department?.description || '')
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async () => {
    if (department) {
      await updateDepartment(department.id, name, description)
    } else {
      await createDepartment(name, description)
    }
    onSuccess()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{department ? 'Edit' : 'Add Department'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{department ? 'Edit' : 'Add'} Department</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button onClick={handleSubmit}>{department ? 'Save' : 'Create'}</Button>
      </DialogContent>
    </Dialog>
  )
}

export default DepartmentForm
