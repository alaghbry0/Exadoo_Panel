export const useClipboard = () => {
  const copy = async (text) => {
    try {
      // استخدام الـ Clipboard API إذا كان مدعومًا
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // طريقة بديلة لنسخ النص
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();

        if (document.execCommand("copy")) {
        } else {
          throw new Error("Clipboard access denied");
        }

        document.body.removeChild(textArea);
      }
    } catch (error) {}
  };

  return { copy };
};
