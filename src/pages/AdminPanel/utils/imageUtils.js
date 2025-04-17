import { uploadImageToSupabase } from './fetchData';

export const handleFileChange = async (
  e,
  isEdit,
  setIsLoading,
  setImagesUrl,
  setImages,
  fileInputRef
) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  setIsLoading(true);

  if (isEdit) {
    const file = files[0];
    const uploadedUrl = await uploadImageToSupabase(file);
    if (uploadedUrl) {
      setImagesUrl((prev) => {
        const currentUrls = prev ? prev.split(',') : [];
        const newUrls = [...currentUrls, uploadedUrl].join(',');
        return newUrls;
      });
      setImages((prev) => [...prev, uploadedUrl]);
    }
  } else {
    const uploadPromises = files.map((file) => uploadImageToSupabase(file));
    const uploadedUrls = await Promise.all(uploadPromises);
    const validUrls = uploadedUrls.filter((url) => url !== null);
    setImagesUrl((prev) => {
      const currentUrls = prev ? prev.split(',').filter((url) => url) : [];
      const newUrls = [...currentUrls, ...validUrls].join(',');
      return newUrls;
    });
    setImages((prev) => [...prev, ...validUrls]);
  }

  setIsLoading(false);
  if (fileInputRef.current) fileInputRef.current.value = '';
};

export const handleRemoveImage = (urlToRemove, isEdit, setImagesUrl, setImages) => {
  if (isEdit) {
    setImagesUrl((prev) => {
      const currentUrls = prev.split(',');
      const filteredUrls = currentUrls.filter((url) => url !== urlToRemove).join(',');
      return filteredUrls;
    });
    setImages((prev) => prev.filter((url) => url !== urlToRemove));
  } else {
    setImagesUrl((prev) => {
      const currentUrls = prev.split(',');
      const filteredUrls = currentUrls.filter((url) => url !== urlToRemove).join(',');
      return filteredUrls;
    });
    setImages((prev) => prev.filter((url) => url !== urlToRemove));
  }
};

export const handleAddColor = (color, isEdit, setState) => {
  if (isEdit) {
    setState((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), color],
    }));
  } else {
    setState((prev) => [...prev, color]);
  }
};

export const handleRemoveColor = (index, isEdit, setState) => {
  if (isEdit) {
    setState((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  } else {
    setState((prev) => prev.filter((_, i) => i !== index));
  }
};

export const updateColor = (index, color, isEdit, setState) => {
  if (isEdit) {
    setState((prev) => {
      const newColors = [...prev.colors];
      newColors[index] = color;
      return { ...prev, colors: newColors };
    });
  } else {
    setState((prev) => {
      const newColors = [...prev];
      newColors[index] = color;
      return newColors;
    });
  }
};