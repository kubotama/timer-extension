import React, { useState, useEffect } from 'react';

const Options: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [newBookmark, setNewBookmark] = useState('');

  useEffect(() => {
    chrome.storage.local.get(['bookmarks'], (result) => {
      if (result.bookmarks) {
        setBookmarks(result.bookmarks);
      }
    });
  }, []);

  const handleSave = () => {
    if (newBookmark) {
      const updatedBookmarks = [...bookmarks, newBookmark];
      chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
        setBookmarks(updatedBookmarks);
        setNewBookmark('');
      });
    }
  };

  return (
    <div>
      <h1>Bookmarks</h1>
      <input
        type="text"
        value={newBookmark}
        onChange={(e) => setNewBookmark(e.target.value)}
        placeholder="Enter a URL"
      />
      <button onClick={handleSave}>Save</button>
      <ul>
        {bookmarks.map((bookmark, index) => (
          <li key={index}>
            <a href={bookmark} target="_blank" rel="noopener noreferrer">
              {bookmark}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Options;