// import axios from "axios";
// import Criminal from "@/types/criminal";
// import DetectedCriminal from "@/types/detectedCriminal";
// import { detect } from "@/lib/detect/detect";
// jest.mock("axios");

// const mockedAxios = axios as jest.Mocked<typeof axios>;

// describe.skip("detect function", () => {
//   test("detects a criminal", async () => {
//     mockedAxios.post.mockResolvedValue({
//       data: { result: "some data" },
//     });

//     const testCriminal = new Criminal("Test Criminal", ["/path/to/image.jpg"]);
//     const testImage = new Image();
//     testImage.src = "/path/to/test/image.jpg";
//     const result = await detect(testImage, [testCriminal], () => {});
//     expect(result).toBeInstanceOf(Array);
//     expect(result[0]).toBeInstanceOf(DetectedCriminal);
//     expect(result[0].criminal.name).toBe("Test Criminal");
//   });
// });
