import cluster from "cluster";
import os from "os";

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  const numCPUs = os.cpus().length;

  // Fork worker processes
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart workers if they exit
  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Each worker runs the Express server
  await import("./server.js");
}
