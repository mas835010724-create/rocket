export function formatViewCount(views: number | string | undefined | null): string {
  if (views === undefined || views === null) return "0";
  
  const numViews = typeof views === 'string' ? parseInt(views, 10) : views;
  
  if (isNaN(numViews)) return "0";

  if (numViews < 1000) {
    return numViews.toString();
  }
  
  if (numViews < 1000000) {
    const kValue = numViews / 1000;
    // Round to 1 decimal place, remove .0 if it exists
    return kValue.toFixed(1).replace(/\.0$/, "") + "K";
  }
  
  if (numViews < 1000000000) {
    const mValue = numViews / 1000000;
    return mValue.toFixed(1).replace(/\.0$/, "") + "M";
  }
  
  const bValue = numViews / 1000000000;
  return bValue.toFixed(1).replace(/\.0$/, "") + "B";
}
