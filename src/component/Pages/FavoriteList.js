import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const FavoriteList = () => {
    const [listItems, setListItems] = useState([]);
    const [lists, setLists] = useState([]);
    const [listName, setListName] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [itemName, setItemName] = useState('');
    const [editItemId, setEditItemId] = useState(null);
    const navigate = useNavigate();
    const { listId } = useParams();

    // Load list items from the backend on component mount
    useEffect(() => {
        fetchListItems();
    }, []);

    const fetchListItems = async () => {
        try {
            const response = await fetch(`/api/lists`);
            if (response.ok) {
                const data = await response.json();
                setListItems(data);
            } else {
                console.error('Error occurred while fetching list items:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while fetching list items:', error);
        }
    };

    const createListItem = async () => {
        try {
            const response = await fetch('/api/lists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: itemName }),
            });
            if (response.ok) {
                const newList = await response.json();
                setLists((prevLists) => [...prevLists, newList]);
                setListItems((prevItems) => [...prevItems, newList]);
                handleCloseDialog();
            } else {
                console.error('Error occurred while creating a list:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while creating a list:', error);
        }
    };

    const deleteListItem = async (id) => {
        try {
            const response = await fetch(`/api/lists/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setListItems((prevItems) => prevItems.filter((item) => item.id !== id));
            } else if (response.status === 404) {
                const errorData = await response.json();
                console.error('Error occurred while deleting a list item:', errorData.error);
            } else {
                console.error('Error occurred while deleting a list item:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while deleting a list item:', error);
        }
    };


    const handleAddListItem = () => {
        setEditItemId(null);
        setOpenDialog(true);
    };

    const handleEditListItem = (id) => {
        const itemToEdit = listItems.find((item) => item.id === id);
        if (itemToEdit) {
            setEditItemId(id);
            setItemName(itemToEdit.name);
            setOpenDialog(true);
        }
    };

    const handleCloseDialog = () => {
        setItemName('');
        setEditItemId(null);
        setOpenDialog(false);
    };

    const handleSaveItem = () => {
        if (editItemId) {
            updateListItem();
        } else {
            setListName(itemName);
            createListItem();
        }
    };

    const updateListItem = async () => {
        try {
            const response = await fetch(`/api/lists/${listId}/items/${editItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: itemName }),
            });
            if (response.ok) {
                const updatedItem = await response.json();
                setListItems((prevItems) => {
                    return prevItems.map((item) => {
                        if (item.id === updatedItem.id) {
                            return updatedItem;
                        }
                        return item;
                    });
                });
                handleCloseDialog();
            } else {
                console.error('Error occurred while updating a list item:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while updating a list item:', error);
        }
    };

    const handleDeleteListItem = (id) => {
        deleteListItem(id);
    };

    const handleItemNameChange = (event) => {
        setItemName(event.target.value);
    };

    const handleListClick = (id) => {
        navigate(`/list/${id}`);
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="75vh"
            marginTop="7rem"
        >
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {listItems.map((item) => (
                    <ListItem
                        key={item.id}
                        button
                        onClick={() => handleListClick(item.id)}
                        sx={{ margin: '2rem', fontFamily: 'Arial', color: '#333' }}
                    >
                        <ListItemText
                            primary={item.name}
                            secondary={item.date}
                            style={{ fontFamily: 'Verdana', color: '#666' }}
                        />
                        <ListItemIcon
                            onClick={() => handleDeleteListItem(item.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <DeleteIcon />
                        </ListItemIcon>
                        <ListItemIcon
                            onClick={() => handleEditListItem(item.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <EditIcon />
                        </ListItemIcon>
                    </ListItem>
                ))}
            </List>

            <Fab color="primary" onClick={handleAddListItem}>
                <AddIcon />
            </Fab>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{editItemId ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Item Name"
                        fullWidth
                        value={itemName}
                        onChange={handleItemNameChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveItem}>{editItemId ? 'Save Changes' : 'Save'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FavoriteList;
