import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { fetchFromAPI } from "../utils/fetchFromAPI";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const onhandleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      navigate(`/search/${searchTerm}`);
      setSearchTerm("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (value.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await fetchFromAPI(
          `search?part=snippet&q=${encodeURIComponent(
            value
          )}&type=video&maxResults=5`
        );
        if (data && data.items) {
          setSuggestions(data.items.map((item) => item.snippet.title));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/search/${suggestion}`);
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <Paper
      component="form"
      onSubmit={onhandleSubmit}
      sx={{
        borderRadius: 20,
        border: "1px solid #e3e3e3",
        pl: 2,
        boxShadow: "none",
        mr: { sm: 5 },
        position: "relative",
      }}
    >
      <input
        className="search-bar"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        autoComplete="off"
      />
      <IconButton
        type="submit"
        sx={{ p: "10px", color: "red" }}
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
      {showSuggestions && suggestions.length > 0 && (
        <List
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            bgcolor: "background.paper",
            border: "1px solid #e3e3e3",
            borderTop: "none",
            zIndex: 10,
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {suggestions.map((suggestion, idx) => (
            <ListItem key={idx} disablePadding>
              <ListItemButton
                onMouseDown={() => handleSuggestionClick(suggestion)}
              >
                <ListItemText primary={suggestion} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default SearchBar;
