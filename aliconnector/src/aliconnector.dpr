{$A8,B-,C+,D+,E-,F-,G+,H+,I+,J-,K-,L+,M-,N+,O+,P+,Q-,R-,S-,T-,U-,V+,W-,X+,Y+,Z1}

program aliconnector;

uses
  Forms,
  fAimBrowser in 'fAimBrowser.pas' {fmMain},
  UExternalContainer in 'UExternalContainer.pas',
  UMyExternal in 'UMyExternal.pas',
  IntfDocHostUIHandler in 'IntfDocHostUIHandler.pas',
  UNulContainer in 'UNulContainer.pas',
  fCommService in 'fCommService.pas' {fmAIMOPC},
  AimBrowser_TLB in 'AimBrowser_TLB.pas';

{$R *.tlb}
{$R *.res}

begin
  Application.Initialize;
  Application.Title := 'Aliconnector';
  Application.CreateForm(TfmMain, fmMain);
  //Application.CreateForm(TfmAIMOPC, fmAIMOPC);
  Application.Run;
end.
