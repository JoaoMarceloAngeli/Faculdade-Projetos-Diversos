/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package persistencia;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.Set;
import java.util.TreeSet;
import modelos.Professor;

/**
 *
 * @author Cliente
 */
public class ManipArq_Matricula{
    private File nomeArqui = new File("");
    
    public ManipArq_Matricula() {
    }
    public ManipArq_Matricula(File nomeArqui) {
        this.nomeArqui = nomeArqui;
    }

    public void setNomeArqui(File nomeArqui) {
        this.nomeArqui = nomeArqui;
    }
    
    public Set<Professor> obterProfess_Matricula() throws Exception{
        try{
        TreeSet<Professor> professores = new TreeSet<>();
        FileReader lerArq = new FileReader(nomeArqui);
        BufferedReader bufLer = new BufferedReader(lerArq);
        String linha = "";
        while((linha = bufLer.readLine()) != null){
        String[] partesLinha = linha.split(";");
        Professor conjtProfessor = new Professor(Integer.parseInt(partesLinha[0]), partesLinha[1], partesLinha[2], partesLinha[3], partesLinha[4]);   
        //Criar objeto contato
        professores.add(conjtProfessor);
        }
        bufLer.close();
        return professores;
        }
        catch (Exception erro){
        throw new Exception(erro.getMessage() + "erro no obter dados");
        }
    }
    
    
}