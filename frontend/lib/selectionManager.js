// Simple selection manager for element selection
export const createSelectionManager = () => {
  let selectedElement = null;
  
  return {
    selectElement: (element) => {
      selectedElement = element;
    },
    
    getSelectedElement: () => selectedElement,
    
    clearSelection: () => {
      selectedElement = null;
    }
  };
};

export default createSelectionManager;





















































