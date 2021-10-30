#!/bin/node
const { ImagePool  } = require('@squoosh/lib')
const fs = require("fs")
const glob = require('glob');
const path = require('path');

let work_dir = process.argv[2];

(async () => {

    glob(work_dir + '/*.png', {}, async(err, files)=>{

        try {
            const imagePool = new ImagePool();            

            let html = ""
            for(var i=0;i<files.length;i++) {            
                const imagePath = files[i];

                
                const image = imagePool.ingestImage(imagePath);

                await image.decoded; //Wait until the image is decoded before running preprocessors. 

                let dims = [ 640, 1024, 1280, 1920]
                let subhtml = ""

                for(let i = 0; i<dims.length; i++) {
                    let dim = dims[i]
                    try {
                        const preprocessOptions = {
                            resize: {"enabled":true,"width":dim,"method":"lanczos3","fitMethod":"stretch","premultiply":true,"linearRGB":true},

                        }
                        await image.preprocess(preprocessOptions);

                        const encodeOptions = {
                            resize: {"enabled":true,"width":dim,"method":"lanczos3","fitMethod":"stretch","premultiply":true,"linearRGB":true},
                            mozjpeg: {"quality":90,"baseline":false,"arithmetic":false,"progressive":true,"optimize_coding":true,"smoothing":0,"color_space":3,"quant_table":3,"trellis_multipass":false,"trellis_opt_zero":false,"trellis_opt_table":false,"trellis_loops":1,"auto_subsample":true,"chroma_subsample":2,"separate_chroma_quality":false,"chroma_quality":75}  
                        }
                        await image.encode(encodeOptions);

                        const rawEncodedImage = (await image.encodedWith.mozjpeg).binary;

                        if (fs.existsSync(work_dir+`/${dim}`) == false)
                            fs.mkdirSync(work_dir+`/${dim}`)

                        let flname = `/${dim}/` + path.basename(imagePath.replace(".png",".jpg"))
                        fs.writeFileSync(work_dir + flname, rawEncodedImage)
                        
                        if (subhtml == "")
                            subhtml = `<img loading="lazy" src="${path.basename(work_dir)+flname}"\n\tsrcset="${path.basename(work_dir)+flname} ${dim}w`
                        else
                            subhtml += ` ${path.basename(work_dir)+flname} ${dim}w`
                        if (i<dims.length-1)
                            subhtml+=","

                    } catch (Ex) {
                        console.log("Inner error: "+Ex)
                    }
                }
                subhtml += `" />\n`
                html += subhtml
            }

            await imagePool.close();

            fs.writeFileSync(work_dir + "/images.html", html)

            console.log(`Execution succeeded, processed ${files.length} images:`)
            console.log(html)
            console.log("\n OK ")

        } catch (Ex) {
            console.log(Ex)
        }


    })

})()