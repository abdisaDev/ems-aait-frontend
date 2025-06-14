{{ ... }}
      const eventSource = new EventSource(`${API_BASE_URL}/scrape-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const messageListener = (event: { data: string }) => {
        if (!event.data) return;
        const progress = JSON.parse(event.data);
        setLoadingMessage(progress.message);

        if (progress.stage === "data") {
          const finalGrades = progress.data;
          setGrades(finalGrades);
          AsyncStorage.setItem("grades", JSON.stringify(finalGrades));
          SecureStore.setItemAsync(
            "credentials",
            JSON.stringify({ username, password })
          );
          setCredentials({ username, password });
          setIsLoggedIn(true);
          setIsLoading(false);
          setLoadingMessage("Sync complete!");
          setTimeout(() => setLoadingMessage(""), 2000);
          cleanup();
          resolve();
        }

        if (progress.stage === "error") {
          setIsLoading(false);
          setTimeout(() => setLoadingMessage(""), 5000); // Show error for 5s
          cleanup();
          reject(new Error(progress.message));
        }
      };

      const errorListener = (error: any) => {
        console.error("EventSource failed:", error);
        setLoadingMessage("Connection error. Could not reach the server.");
        setIsLoading(false);
        setTimeout(() => setLoadingMessage(""), 5000);
        cleanup();
        reject(new Error("Connection error"));
      };

      const openListener = () => {
        setLoadingMessage("Connection open. Starting data sync...");
      };

      const cleanup = () => {
        eventSource.removeEventListener("message", messageListener);
        eventSource.removeEventListener("error", errorListener);
        eventSource.removeEventListener("open", openListener);
        eventSource.close();
      };

      eventSource.addEventListener("message", messageListener);
      eventSource.addEventListener("error", errorListener);
      eventSource.addEventListener("open", openListener);

      // Return a cleanup function for the promise
      return cleanup;
    });
  };

{{ ... }}
