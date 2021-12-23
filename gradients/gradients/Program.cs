using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;
using System.Diagnostics;

namespace gradients
{
    class Program
    {
        struct ColorRGBNormalized
        {
            public double R;
            public double G;
            public double B;
            public override string ToString()
            {
                return $"{R} {G} {B}";
            }
        }

        static Color HSVtoRGB(double h, double s, double v)
        {
            h =
            h < 0 ?
                0
            : h > 360 ?
                360
            :
                h;

            s =
            s < 0 ?
                0
            : s > 1 ?
                1
            :
                s;

            v =
            v < 0 ?
                0
            : v > 1 ?
                1
            :
                v;


            double c = v * s;
            double x = c * (1 - Math.Abs((h / 60) % 2 - 1));
            double m = v - c;

            ColorRGBNormalized normalizedRGB =
            h < 60 ?
                new ColorRGBNormalized { R = c, G = x, B = 0 }
            : h < 120 ?
                new ColorRGBNormalized { R = x, G = c, B = 0 }
            : h < 180 ?
                new ColorRGBNormalized { R = 0, G = c, B = x }
            : h < 240 ?
                new ColorRGBNormalized { R = 0, G = x, B = c }
            : h < 300 ?
                new ColorRGBNormalized { R = x, G = 0, B = c }
            :
                new ColorRGBNormalized { R = c, G = 0, B = x };

            return Color.FromArgb(
                    (int)((normalizedRGB.R + m) * 255),
                    (int)((normalizedRGB.G + m) * 255),
                    (int)((normalizedRGB.B + m) * 255)
                );
        }

        static object saveLock = new object();
        static object hPlusPlusLock = new object();
        static int hGlob = -1;
        static void GenerateHuedGradientPNG()
        {
            int h;
            lock (hPlusPlusLock)
                h = hGlob++;

            Bitmap gradient = new Bitmap(1000, 1000);

            for (int x = 0; x < gradient.Width; x++)
                for (int y = 0; y < gradient.Height; y++)
                    gradient.SetPixel(x, y, HSVtoRGB(h, (double)x / gradient.Width, 1 - (double)y / gradient.Height));

            lock (saveLock)
                gradient.Save($"C:\\Users\\MichaelDusk\\Desktop\\New Folder\\gradient{h}.png", System.Drawing.Imaging.ImageFormat.Png);
        }

        static void Main(string[] args)
        {
            //MultithreadedGradients();
            Bitmap gradient = new Bitmap(1000, 1000);

            for (int x = 0; x < gradient.Width; x++)
                for (int y = 0; y < gradient.Height; y++)
                {
                    Color color = Color.FromArgb((int)(255 * (double)x / gradient.Width *(1 - (double)y / gradient.Height)), HSVtoRGB(0, (double)x / gradient.Width, 1 - (double)y / gradient.Height));
                    gradient.SetPixel(x, y, color);
                }

            lock (saveLock)
                gradient.Save($"C:\\Users\\MichaelDusk\\Desktop\\gradient.png", System.Drawing.Imaging.ImageFormat.Png);
            Console.ReadKey();
            //tasks   00:00:41.7479305
            //without 00:07:25.6785270
        }

        private static void MultithreadedGradients()
        {
            Stopwatch stopwatch = new Stopwatch();
            List<Task> taskList = new List<Task>();

            stopwatch.Start();
            for (int h = 0; h < 360; h++)
                taskList.Add(Task.Run(GenerateHuedGradientPNG));
            Task.WaitAll(taskList.ToArray());
            stopwatch.Stop();
            Console.WriteLine($"{stopwatch.Elapsed}");
        }
    }
}
