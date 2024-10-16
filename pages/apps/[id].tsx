import Dropdown from '../../components/Dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { IRootState } from '../../store';
import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconPlus from '@/components/Icon/IconPlus';
import IconPlusCircle from '@/components/Icon/IconPlusCircle';
import IconHorizontalDots from '@/components/Icon/IconHorizontalDots';
import IconEdit from '@/components/Icon/IconEdit';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconX from '@/components/Icon/IconX';
import axios from 'axios';
import { addColumn, addTask, deleteColumn, deleteTask, editColumn, editTask } from '@/store/features/scrumboardSlice';
import { useRouter } from 'next/router';

const Scrumboard = () => {
    const dispatch = useDispatch();
    const [projectListNew, setProjectListNew] = useState<any>([]);
    const [boardId, setBoardId] = useState<any>([]);
    const loadingTask = useSelector((state: any) => state.scrumboard.loadingTask);
    const loadingColumn = useSelector((state: any) => state.scrumboard.loadingColumn);

    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        dispatch(setPageTitle('Scrumboard'));
    });

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:3123/users/${id}/boards`);
            setProjectListNew(response.data[0].columns);
            setBoardId(response.data[0].id);
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [params, setParams] = useState<any>({
        id: null,
        title: '',
    });

    const [paramsTask, setParamsTask] = useState<any>({
        projectId: null,
        id: null,
        title: '',
        description: '',
        tags: '',
        date: '',
    });

    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isAddProjectModal, setIsAddProjectModal] = useState(false);
    const [isAddTaskModal, setIsAddTaskModal] = useState(false);
    const [isDeleteModal, setIsDeleteModal] = useState(false);

    const handleDeleteColumn = async (columnId: string) => {
        try {
            await dispatch(deleteColumn(columnId) as any);
            await fetchData();
            showMessage('A coluna foi deletada com sucesso.');
        } catch (error) {
            showMessage('A coluna não foi deletada.', 'error');
            console.log('Erro ao deletar a coluna:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await dispatch(deleteTask(taskId) as any);
            await fetchData();
            setIsDeleteModal(false);
            showMessage('A tarefa foi deletada com sucesso.');
        } catch (error) {
            showMessage('A tarefa não foi deletada.', 'error');
            console.error('Erro ao deletar a tarefa:', error);
        }
    };

    const addTaskData = (e: any) => {
        const { id, value } = e.target;
        setParamsTask((prev: any) => ({
            ...prev,
            [id]: value,
        }));
    };

    const saveTask = async (e: any) => {
        e.preventDefault();
        try {
            if (paramsTask.id && paramsTask?.createdAt !== '') {
                await dispatch(editTask({ id: paramsTask.id, updatedTask: paramsTask }) as any);
            } else {
                await dispatch(addTask({ columnId: paramsTask.projectId, updateTask: paramsTask }) as any);
            }

            await fetchData();
            setParamsTask({
                id: null,
                title: '',
                description: '',
                tags: '',
                date: '',
            });
            setIsAddTaskModal(false);

            showMessage('A tarefa foi salva com sucesso.');
        } catch (error) {
            showMessage('A tarefa não foi salva.', 'error');
            console.log('Erro ao salvar a tarefa:', error);
        }
    };

    const addColumnData = (e: any) => {
        const { id, value } = e.target;
        setParams((prev: any) => ({
            ...prev,
            [id]: value,
        }));
    };

    const saveColumn = async (e: any) => {
        e.preventDefault();
        try {
            if (params.id && params?.createdAt !== '') {
                await dispatch(editColumn({ id: params.id, updatedColumns: params }) as any);
            } else {
                await dispatch(
                    addColumn({
                        id: boardId,
                        newColumn: params,
                    }) as any
                );
            }

            await fetchData();
            setParams({
                id: null,
                title: '',
            });
            setIsAddProjectModal(false);

            showMessage('A coluna foi salva com sucesso.');
        } catch (error) {
            showMessage('A coluna não foi salva.', 'error');

            console.log('Erro ao salvar a tarefa:', error);
        }
    };

    const addEditColumn = (projectId: any, column: any = null) => {
        setParamsTask({
            projectId: '670d5009d9fb63fc0c257dff',
            id: null,
            title: '',
        });
        if (column) {
            let data = JSON.parse(JSON.stringify(column));
            data.projectId = projectId;
            setParams(data);
        }
        setIsAddProjectModal(true);
    };

    const addEditTask = (projectId: any, task: any = null) => {
        setParamsTask({
            projectId: projectId,
            id: null,
            title: '',
            description: '',
            tags: '',
            date: '',
        });
        if (task) {
            let data = JSON.parse(JSON.stringify(task));
            data.projectId = projectId;
            data.tags = data.tags ? data.tags.toString() : '';
            setParamsTask(data);
        }
        setIsAddTaskModal(true);
    };

    const deleteConfirmModal = (projectId: any, task: any = null) => {
        setSelectedTask(task);
        setTimeout(() => {
            setIsDeleteModal(true);
        }, 10);
    };

    const [previousGroupId, setPreviousGroupId] = useState(null);

    const moveTask = async (taskId: string | number, newGroupId: string | number) => {
        try {
            const response = await axios.put(`http://localhost:3123/tasks/${taskId}/move`, { newColumnId: newGroupId });

            if (!response.data) {
                throw new Error('Erro ao mover a tarefa');
            }
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
        }
    };

    return (
        <div>
            <div>
                <button type="button" className="btn btn-primary flex" onClick={addEditColumn}>
                    <IconPlus className="h-5 w-5 ltr:mr-3 rtl:ml-3" />
                    Adicionar Coluna
                </button>
            </div>

            <div className="relative pt-5">
                <div className="perfect-scrollbar -mx-2 h-full">
                    <div className="flex flex-nowrap items-start gap-5 overflow-x-auto px-2 pb-2">
                        {projectListNew.map((project: any) => {
                            return (
                                <div key={project.seq} className="panel w-80 flex-none" data-group={project.seq} data-group-id={project.id}>
                                    <div className="mb-5 flex justify-between">
                                        <h4 className="text-base font-semibold uppercase">{project.title}</h4>

                                        <div className="flex items-center">
                                            <button onClick={() => addEditTask(project.id)} type="button" className="hover:text-primary ltr:mr-2 rtl:ml-2">
                                                <IconPlusCircle />
                                            </button>
                                            <div className="dropdown">
                                                <Dropdown
                                                    offset={[0, 5]}
                                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                    button={<IconHorizontalDots className="opacity-70 hover:opacity-100" />}
                                                >
                                                    <ul>
                                                        <li>
                                                            <button type="button" onClick={() => addEditColumn(project.id, project)}>
                                                                Editar
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    handleDeleteColumn(project.id);
                                                                }}
                                                            >
                                                                Deletar
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    </div>

                                    <ReactSortable
                                        list={project.tasks}
                                        setList={(newState, sortable) => {
                                            if (sortable) {
                                                const groupId = sortable.el.closest('[data-group]')?.getAttribute('data-group') || 0;
                                                const columnId = sortable.el.closest('[data-group-id]')?.getAttribute('data-group-id') || 0;

                                                // Atualiza a lista de tarefas
                                                const newList = projectListNew.map((taskList: { seq: string; tasks: ItemInterface[] }) => {
                                                    if (parseInt(taskList.seq) === parseInt(groupId)) {
                                                        taskList.tasks = newState;
                                                    }
                                                    return taskList;
                                                });

                                                setProjectListNew(newList);

                                                if (previousGroupId !== null && previousGroupId !== groupId) {
                                                    newState.forEach((task) => {
                                                        moveTask(task.id, columnId);
                                                    });
                                                }

                                                setPreviousGroupId(groupId);
                                            }
                                        }}
                                        animation={200}
                                        group={{ name: 'shared', pull: true, put: true }}
                                        ghostClass="sortable-ghost"
                                        dragClass="sortable-drag"
                                        className="connect-sorting-content min-h-[150px]"
                                    >
                                        {project.tasks.map((task: any) => {
                                            return (
                                                <div className="sortable-list " key={project.seq + '' + task.seq}>
                                                    <div className="mb-5 cursor-move space-y-3 rounded-md bg-[#f4f4f4] p-3 pb-5 shadow dark:bg-white-dark/20">
                                                        {task.image ? <img src="/assets/images/carousel1.jpeg" alt="images" className="h-32 w-full rounded-md object-cover" /> : ''}
                                                        <div className="text-base font-bold">{task.title}</div>
                                                        <p className="break-all text-justify">{task.description}</p>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center font-medium hover:text-primary">
                                                                <span></span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <button onClick={() => addEditTask(project.id, task)} type="button" className="hover:text-info">
                                                                    <IconEdit className="ltr:mr-3 rtl:ml-3" />
                                                                </button>
                                                                <button onClick={() => deleteConfirmModal(project.seq, task)} type="button" className="hover:text-danger">
                                                                    <IconTrashLines />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </ReactSortable>
                                    <div className="pt-3">
                                        <button type="button" className="btn btn-primary mx-auto" onClick={() => addEditTask(project.id)}>
                                            <IconPlus />
                                            Adicionar Tarefa
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Transition appear show={isAddProjectModal} as={Fragment}>
                <Dialog as="div" open={isAddProjectModal} onClose={() => setIsAddProjectModal(false)} className="relative z-50">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60 px-4">
                        <div className="flex min-h-screen items-center justify-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddProjectModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">
                                        {params.id ? 'Editar Coluna' : 'Adicionar Coluna'}
                                    </div>
                                    <div className="p-5">
                                        <form onSubmit={saveColumn}>
                                            <div className="grid gap-5">
                                                <div>
                                                    <label htmlFor="title">Nome</label>
                                                    <input id="title" value={params.title} onChange={addColumnData} type="text" className="form-input mt-1" placeholder="Coluna XPTO" />
                                                </div>
                                            </div>

                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setIsAddProjectModal(false)}>
                                                    Cancelar
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" disabled={loadingColumn}>
                                                    {loadingColumn ? (
                                                        <div className="flex items-center">
                                                            <svg className="mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                            </svg>
                                                            Processando...
                                                        </div>
                                                    ) : params.id ? (
                                                        'Atualizar'
                                                    ) : (
                                                        'Adicionar'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition appear show={isAddTaskModal} as={Fragment}>
                <Dialog as="div" open={isAddTaskModal} onClose={() => setIsAddTaskModal(false)} className="relative z-50">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto">
                        <div className="flex min-h-screen items-center justify-center px-4">
                            <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button onClick={() => setIsAddTaskModal(false)} type="button" className="absolute top-4 text-white-dark hover:text-dark ltr:right-4 rtl:left-4">
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">
                                    {paramsTask.id ? 'Editar Tarefa' : 'Adicionar Tarefa'}
                                </div>
                                <div className="p-5">
                                    <form onSubmit={saveTask}>
                                        <div className="grid gap-5">
                                            <div>
                                                <label htmlFor="taskTitle">Título</label>
                                                <input id="title" value={paramsTask.title} onChange={addTaskData} type="text" className="form-input" placeholder="Título XPTO ..." />
                                            </div>

                                            <div>
                                                <label htmlFor="taskdesc">Descrição</label>
                                                <textarea
                                                    id="description"
                                                    value={paramsTask.description}
                                                    onChange={addTaskData}
                                                    className="form-textarea min-h-[130px]"
                                                    placeholder="Descrição XPTO ..."
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex items-center justify-end">
                                            <button onClick={() => setIsAddTaskModal(false)} type="button" className="btn btn-outline-danger">
                                                Cancelar
                                            </button>
                                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" disabled={loadingTask}>
                                                {loadingTask ? (
                                                    <div className="flex items-center">
                                                        <svg className="mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                        </svg>
                                                        Processando...
                                                    </div>
                                                ) : paramsTask.id ? (
                                                    'Atualizar'
                                                ) : (
                                                    'Adicionar'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition appear show={isDeleteModal} as={Fragment}>
                <Dialog as="div" open={isDeleteModal} onClose={() => setIsDeleteModal(false)} className="relative z-50">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto">
                        <div className="flex min-h-screen items-center justify-center px-4 ">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel my-8 w-[90%] max-w-lg overflow-hidden rounded-lg border-0 p-0 md:w-full">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDeleteModal(false);
                                        }}
                                        className="absolute top-4 text-white-dark ltr:right-4 rtl:left-4"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] dark:text-[#FFF] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">Deletar Tarefa</div>
                                    <div className="p-5 text-center">
                                        <div className="mx-auto w-fit rounded-full bg-danger p-4 text-white ring-4 ring-danger/30">
                                            <IconTrashLines />
                                        </div>
                                        <div className="mx-auto mt-5 text-base dark:text-[#FFF] sm:w-3/4">Tem certeza de que deseja excluir a tarefa?</div>

                                        <div className="mt-8 flex items-center justify-center">
                                            <button
                                                onClick={() => {
                                                    setIsDeleteModal(false);
                                                }}
                                                type="button"
                                                className="btn btn-outline-danger"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleDeleteTask(selectedTask.id);
                                                }}
                                                type="button"
                                                className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                            >
                                                Deletar
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};
export default Scrumboard;
